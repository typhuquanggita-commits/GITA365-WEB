/* Studio production ledger. Rendering stays outside the Worker; this module
   stores only reviewed metadata, approvals, and a signed publication record. */
'use strict';
import { laNguoiNha, roleOf, tenNguoiDung } from './vai-tro.js';

const TRANG_THAI = ['draft', 'scriptApproved', 'rightsApproved', 'rendered', 'qcPassed', 'published'];
const TIEP = {
  draft: 'scriptApproved', scriptApproved: 'rightsApproved',
  rightsApproved: 'rendered', rendered: 'qcPassed', qcPassed: 'published'
};
const text = value => String(value || '').trim();
const now = () => new Date().toISOString();
const id = () => crypto.randomUUID().replace(/-/g, '');
const V20_RATIOS = {'9:16': [1080, 1920], '16:9': [1920, 1080], '1:1': [1080, 1080]};
const V20_QC = ['assetRights', 'audio', 'captions', 'safeArea', 'flicker', 'brand', 'accessibility'];
const SHA256 = /^[a-f0-9]{64}$/i;

function stable(value) {
  if (Array.isArray(value)) return '[' + value.map(stable).join(',') + ']';
  if (value && typeof value === 'object') {
    return '{' + Object.keys(value).sort().map(k => JSON.stringify(k) + ':' + stable(value[k])).join(',') + '}';
  }
  return JSON.stringify(value == null ? null : value);
}
async function sha(value) {
  const b = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(stable(value)));
  return Array.from(new Uint8Array(b)).map(x => x.toString(16).padStart(2, '0')).join('');
}
async function hmac(secret, value) {
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret), {name: 'HMAC', hash: 'SHA-256'}, false, ['sign']);
  const b = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(stable(value)));
  return Array.from(new Uint8Array(b)).map(x => x.toString(16).padStart(2, '0')).join('');
}
function canUse(hoSo) { return laNguoiNha(hoSo); }
function canManage(row, hoSo) { return row.createdBy === hoSo.uid || roleOf(hoSo) === 'R01'; }
function canManageVoices(hoSo) { return ['R01', 'R02'].includes(roleOf(hoSo)); }
function from(row) {
  return {
    id: row.id, version: row.version, status: row.status, title: row.title,
    project: JSON.parse(row.projectJson || '{}'), rights: JSON.parse(row.rightsJson || '{}'),
    render: JSON.parse(row.renderJson || '{}'), qc: JSON.parse(row.qcJson || '{}'),
    passportId: row.passportId || '', createdAt: row.createdAt, updatedAt: row.updatedAt
  };
}
async function event(db, projectId, version, fromStatus, toStatus, hoSo, payload, reason) {
  await db.prepare('INSERT INTO studioEvent (id,projectId,version,fromStatus,toStatus,actorId,actorRole,payloadHash,reason,createdAt) VALUES (?,?,?,?,?,?,?,?,?,?)')
    .bind(id(), projectId, version, fromStatus, toStatus, hoSo.uid, roleOf(hoSo), await sha(payload), text(reason).slice(0, 500), now()).run();
}
async function get(db, projectId) {
  return await db.prepare('SELECT * FROM studioProject WHERE id=?').bind(text(projectId)).first();
}
function bad(message) { return {ok: false, error: message}; }
function safeVoice(row) {
  return {
    id: row.id, tier: row.tier, provider: row.provider, voiceId: row.voiceId,
    locale: row.locale, style: row.style, allowedUse: row.allowedUse,
    licenseRef: row.licenseRef, consent: (() => {
      const consent = JSON.parse(row.consentJson || '{}');
      return {verified: consent.verified === true, scope: text(consent.scope)};
    })(),
    sampleHash: row.sampleHash, review: JSON.parse(row.reviewJson || '{}'),
    status: row.status, reviewedBy: row.reviewedBy, reviewedAt: row.reviewedAt,
    createdAt: row.createdAt, updatedAt: row.updatedAt
  };
}
function voiceInput(value) {
  const voice = value || {};
  const tier = text(voice.tier);
  const provider = text(voice.provider).slice(0, 80);
  const voiceId = text(voice.voiceId).slice(0, 160);
  const locale = text(voice.locale).slice(0, 32);
  const allowedUse = text(voice.allowedUse).slice(0, 240);
  const licenseRef = text(voice.licenseRef).slice(0, 500);
  const sampleHash = text(voice.sampleHash).toLowerCase();
  const consent = voice.consent && typeof voice.consent === 'object' ? voice.consent : {};
  const review = voice.review && typeof voice.review === 'object' ? voice.review : {};
  if (!['licensed', 'verifiedPrivate'].includes(tier) || !provider || !voiceId ||
      !/^[a-z]{2,3}-[A-Z]{2,4}$/.test(locale) || !allowedUse || !licenseRef)
    return null;
  if (tier === 'verifiedPrivate' && (!consent.verified || !text(consent.attestedBy) ||
      !text(consent.scope) || !SHA256.test(sampleHash))) return null;
  if (tier === 'licensed' && sampleHash && !SHA256.test(sampleHash)) return null;
  return {tier, provider, voiceId, locale, style: text(voice.style).slice(0, 160),
    allowedUse, licenseRef, consent, sampleHash, review};
}
function reviewReady(review) {
  const cases = ['training', 'advisory', 'story', 'family'];
  return text(review.evaluator).length >= 3 && cases.every(key => {
    const score = Number(review[key]);
    return Number.isFinite(score) && score >= 1 && score <= 5;
  }) && Number(review.costPerMinute) >= 0 && review.blindTest === true;
}
async function approvedVoices(db, ids) {
  const unique = [...new Set((Array.isArray(ids) ? ids : []).map(text).filter(Boolean))];
  if (!unique.length) return [];
  if (unique.length > 12) return null;
  const rows = await db.prepare('SELECT * FROM studioVoice WHERE status=? AND id IN (' +
    unique.map(() => '?').join(',') + ')').bind('approved', ...unique).all();
  return (rows.results || []).map(safeVoice);
}

export async function docKhoGiongStudio(y, env, db, hoSo) {
  if (!canUse(hoSo)) return bad('Kho giọng Studio chỉ mở cho nhân sự được cấp quyền.');
  const all = await db.prepare('SELECT * FROM studioVoice WHERE status=? ORDER BY locale,tier,provider,voiceId')
    .bind('approved').all();
  return {ok: true, voices: (all.results || []).map(safeVoice)};
}

export async function ghiKhoGiongStudio(y, env, db, hoSo) {
  if (!canManageVoices(hoSo)) return bad('Chỉ R01/R02 được quản trị kho giọng.');
  const voice = voiceInput(y.voice);
  if (!voice) return bad('Hồ sơ giọng thiếu tier, nhà cung cấp, voiceId, locale, phạm vi, giấy phép hoặc xác minh giọng riêng.');
  const status = text(y.status || 'candidate');
  if (!['candidate', 'approved', 'retired'].includes(status)) return bad('Trạng thái giọng không hợp lệ.');
  if (status === 'approved' && !reviewReady(voice.review))
    return bad('Duyệt giọng cần nghe mù đủ 4 ngữ cảnh, người đánh giá và chi phí/phút.');
  const voiceId = text(y.id) || id(), luc = now();
  const exists = await db.prepare('SELECT id FROM studioVoice WHERE id=?').bind(voiceId).first();
  if (exists) {
    await db.prepare('UPDATE studioVoice SET tier=?,provider=?,voiceId=?,locale=?,style=?,allowedUse=?,licenseRef=?,consentJson=?,sampleHash=?,reviewJson=?,status=?,reviewedBy=?,reviewedAt=?,updatedAt=? WHERE id=?')
      .bind(voice.tier, voice.provider, voice.voiceId, voice.locale, voice.style, voice.allowedUse,
        voice.licenseRef, JSON.stringify(voice.consent), voice.sampleHash, JSON.stringify(voice.review),
        status, status === 'approved' ? tenNguoiDung(hoSo) : '', status === 'approved' ? luc : '', luc, voiceId).run();
  } else {
    await db.prepare('INSERT INTO studioVoice (id,tier,provider,voiceId,locale,style,allowedUse,licenseRef,consentJson,sampleHash,reviewJson,status,reviewedBy,reviewedAt,createdBy,createdAt,updatedAt) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)')
      .bind(voiceId, voice.tier, voice.provider, voice.voiceId, voice.locale, voice.style, voice.allowedUse,
        voice.licenseRef, JSON.stringify(voice.consent), voice.sampleHash, JSON.stringify(voice.review),
        status, status === 'approved' ? tenNguoiDung(hoSo) : '', status === 'approved' ? luc : '',
        hoSo.uid, luc, luc).run();
  }
  return {ok: true, id: voiceId, status};
}
function v20Delivery(project) {
  const d = project && project.v20 && project.v20.delivery;
  const expected = d && V20_RATIOS[text(d.tiLe)];
  if (!d || text(d.phienBan) !== 'V20' || !expected ||
      Number(d.rong) !== expected[0] || Number(d.cao) !== expected[1] ||
      ![24, 25, 30, 60].includes(Number(d.fps)) ||
      !(Number(d.thoiLuongToiDa) >= 30 && Number(d.thoiLuongToiDa) <= 300) ||
      !text(d.kenh) || !text(d.template) || Number(d.nganSachRender) < 0) return null;
  return d;
}
function journeyOk(project) {
  const j = project && project.journey;
  if (!j) return true;
  const allowed = ['private', 'coach', 'family'];
  if (!j.consent || !text(j.reviewedBy) || !allowed.includes(text(j.shareScope)) ||
      !Array.isArray(j.signals)) return false;
  /* Video hành trình là bản ghi động viên, không được mang dữ liệu nhận dạng
     hoặc so sánh/điểm xếp hạng từ hệ thống. */
  const serial = stable(j).toLowerCase();
  if (/(email|phone|dien.?thoai|khachhangid|customerid|hosoapp|xep.?hang|ranking)/.test(serial)) return false;
  return true;
}

export async function taoStudioProject(y, env, db, hoSo) {
  if (!canUse(hoSo)) return bad('Studio chỉ mở cho nhân sự được cấp quyền.');
  const project = y.project || {}, title = text(project.title || project.ten || y.title);
  if (title.length < 3) return bad('Dự án cần tên ít nhất 3 ký tự.');
  const projectId = id(), luc = now(), snapshot = {
    title, scenes: Array.isArray(project.scenes) ? project.scenes : [], kho: text(project.kho),
    tang: text(project.tang), nguon: text(project.nguon), dieuNho: text(project.dieuNho),
    v20: project.v20 || {}, bienSoan: project.bienSoan || {}, journey: project.journey || null,
    voiceIds: Array.isArray(project.voiceIds) ? project.voiceIds.map(text).filter(Boolean).slice(0, 12) : []
  };
  await db.prepare('INSERT INTO studioProject (id,version,status,title,projectJson,rightsJson,renderJson,qcJson,createdBy,createdAt,updatedAt) VALUES (?,?,?,?,?,?,?,?,?,?,?)')
    .bind(projectId, 1, 'draft', title, JSON.stringify(snapshot), '{}', '{}', '{}', hoSo.uid, luc, luc).run();
  await event(db, projectId, 1, '', 'draft', hoSo, snapshot, 'Tạo dự án Studio');
  return {ok: true, project: {id: projectId, version: 1, status: 'draft', title, project: snapshot}};
}

export async function docStudioProject(y, env, db, hoSo) {
  if (!canUse(hoSo)) return bad('Studio chỉ mở cho nhân sự được cấp quyền.');
  const row = await get(db, y.projectId);
  if (!row || !canManage(row, hoSo)) return bad('Không tìm thấy dự án Studio.');
  const events = await db.prepare('SELECT fromStatus,toStatus,actorRole,reason,createdAt FROM studioEvent WHERE projectId=? ORDER BY createdAt ASC')
    .bind(row.id).all();
  return {ok: true, project: from(row), events: (events.results || [])};
}

export async function chuyenTrangThaiStudio(y, env, db, hoSo) {
  if (!canUse(hoSo)) return bad('Studio chỉ mở cho nhân sự được cấp quyền.');
  const row = await get(db, y.projectId);
  if (!row || !canManage(row, hoSo)) return bad('Không tìm thấy dự án Studio.');
  const next = text(y.to);
  if (TIEP[row.status] !== next) return bad('Không thể bỏ qua cổng sản xuất.');
  /* Kịch bản được đóng băng ngay khi qua cổng đầu. Mọi sửa đổi sau đó phải
     quay về bản nháp mới, không thể âm thầm đổi nội dung đã được duyệt. */
  const project = row.status === 'draft'
    ? (y.project || JSON.parse(row.projectJson || '{}'))
    : JSON.parse(row.projectJson || '{}');
  const rights = y.rights || JSON.parse(row.rightsJson || '{}');
  const render = y.render || JSON.parse(row.renderJson || '{}');
  const qc = y.qc || JSON.parse(row.qcJson || '{}');
  const scenes = Array.isArray(project.scenes) ? project.scenes : [];
  const bienSoan = project.bienSoan || {};
  const voices = await approvedVoices(db, project.voiceIds);
  if (next === 'scriptApproved' && (!text(project.title || row.title) || !scenes.length || !v20Delivery(project) ||
      text(bienSoan.nguon).length < 4 || text(bienSoan.chuyenGia).length < 3 ||
      (text(bienSoan.mucDich) === 'tiep-thi' && bienSoan.marketingApproved !== true) || !y.contentChecked ||
      voices === null || voices.length !== (project.voiceIds || []).length))
    return bad('Duyệt kịch bản V20 cần cảnh, nguồn, chuyên gia duyệt, chuẩn bàn giao, soát nội dung đạt; nội dung tiếp thị còn cần duyệt người thật.');
  if (next === 'scriptApproved' && !journeyOk(project))
    return bad('Video hành trình cần đồng ý rõ ràng, người rà nội dung, phạm vi chia sẻ hợp lệ và không chứa dữ liệu nhận dạng/xếp hạng.');
  if (next === 'rightsApproved' && (!rights.imageConsent || !rights.voiceConsent || !rights.musicRights || !text(rights.attestedBy)))
    return bad('Duyệt quyền cần xác nhận ảnh, giọng, nhạc và người chịu trách nhiệm.');
  if (next === 'rendered' && (!text(render.renderer) || !SHA256.test(text(render.outputHash)) ||
      !SHA256.test(text(render.thumbnailHash)) || !SHA256.test(text(render.manifestHash)) ||
      text(render.projectId) !== row.id || !/^[A-Za-z0-9_-]{1,128}$/.test(text(render.jobId)) ||
      !v20Delivery(project) || !(Number(render.duration) >= 30) ||
      Number(render.duration) > Number(v20Delivery(project).thoiLuongToiDa) || !Number(render.sceneCount) ||
      !Array.isArray(render.voiceAssets) || render.voiceAssets.length !== (project.voiceIds || []).length ||
      render.voiceAssets.some(asset => !asset || !project.voiceIds.includes(text(asset.voiceId)) ||
        !SHA256.test(text(asset.audioHash)))))
    return bad('Ghi nhận render V20 cần project/job đúng, checksum manifest/MP4/thumbnail, thời lượng, số cảnh và manifest V20 hợp lệ.');
  if (next === 'qcPassed') {
    if (row.createdBy === hoSo.uid) return bad('Người tạo dự án không thể tự duyệt QC.');
    if (!qc.approved || !text(qc.reviewer) || (qc.lights || []).some(x => x && x.tt === 'bad') ||
        V20_QC.some(key => !qc.v20 || qc.v20[key] !== true))
      return bad('QC V20 cần người duyệt độc lập, đủ các hạng mục bắt buộc, không có đèn đỏ và xác nhận đạt.');
  }
  if (next === 'published' && roleOf(hoSo) !== 'R01') return bad('Chỉ R01 được phát hành video.');
  if (next === 'published' && !env.GITA_KHOA_KY) return bad('Máy chủ chưa nạp khoá ký hộ chiếu video.');
  const luc = now();
  const update = await db.prepare('UPDATE studioProject SET status=?,title=?,projectJson=?,rightsJson=?,renderJson=?,qcJson=?,updatedAt=? WHERE id=? AND status=?')
    .bind(next, text(project.title || row.title), JSON.stringify(project), JSON.stringify(rights), JSON.stringify(render), JSON.stringify(qc), luc, row.id, row.status).run();
  if (!update.meta.changes) return bad('Dự án vừa được thay đổi; hãy tải lại trước khi tiếp tục.');
  await event(db, row.id, row.version, row.status, next, hoSo, {project, rights, render, qc}, y.reason);
  let passport = null;
  if (next === 'published') {
    passport = {id: id(), projectId: row.id, version: row.version, title: text(project.title || row.title),
      publishedAt: luc, publishedBy: tenNguoiDung(hoSo), manifestHash: await sha({project, rights, render, qc})};
    const signature = await hmac(env.GITA_KHOA_KY, passport);
    await db.prepare('INSERT INTO studioPassport (id,projectId,version,manifestJson,manifestHash,signature,issuedBy,issuedAt) VALUES (?,?,?,?,?,?,?,?)')
      .bind(passport.id, row.id, row.version, JSON.stringify({project, rights, render, qc}), passport.manifestHash, signature, hoSo.uid, luc).run();
    await db.prepare('UPDATE studioProject SET passportId=? WHERE id=?').bind(passport.id, row.id).run();
    passport.signature = signature;
  }
  return {ok: true, status: next, passport};
}
