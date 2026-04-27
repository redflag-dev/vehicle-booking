export const SERIES_COLORS = {
  'E202':       '#1565C0',
  'E001':       '#00695C',
  'E009':       '#558B2F',
  'E007':       '#6A1B9A',
  'P301':       '#E65100',
  'P201':       '#AD1457',
  'P567':       '#0277BD',
  'E202-10': '#37474F',
}

export const TEST_TYPES = [
  { label: 'GE/CT',  color: '#7B1FA2', bg: '#F3E5F5' },
  { label: 'AS',     color: '#1565C0', bg: '#E3F2FD' },
  { label: 'FL',     color: '#2E7D32', bg: '#E8F5E9' },
  { label: 'IA',     color: '#E65100', bg: '#FFF3E0' },
  { label: 'PS',     color: '#00695C', bg: '#E0F2F1' },
  { label: 'Driving',color: '#880E4F', bg: '#FCE4EC' },
  { label: '稳定性', color: '#37474F', bg: '#ECEFF1' },
  { label: '预集成', color: '#4527A0', bg: '#EDE7F6' },
  { label: 'OTA测试',color: '#0277BD', bg: '#E1F5FE' },
  { label: '其他',   color: '#5D4037', bg: '#EFEBE9' },
]

export const TEST_TYPE_MAP = Object.fromEntries(TEST_TYPES.map(t => [t.label, t]))

export function getSeries(id) {
  if (!id) return '其他'
  if (id.startsWith('E202-10-')) return 'E202-10'
  if (id.startsWith('E202')) return 'E202'
  if (id.startsWith('E001')) return 'E001'
  if (id.startsWith('E009')) return 'E009'
  if (id.startsWith('E007')) return 'E007'
  if (id.startsWith('P301')) return 'P301'
  if (id.startsWith('P201')) return 'P201'
  if (id.startsWith('P567')) return 'P567'
  // for unknown prefixes, use the alphabetic+digit prefix as the series
  const m = id.match(/^([A-Za-z]+\d+)/)
  return m ? m[1] : '其他'
}

export function parsePlateExpiry(plateStr) {
  if (!plateStr) return null
  // ISO date stored by the new date picker: YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(plateStr)) {
    return new Date(plateStr + 'T00:00:00')
  }
  // Legacy free-text: 临牌M.D过期 / 临牌M/D过期
  const m = plateStr.match(/临牌(\d+)[./](\d+)/)
  if (!m) return null
  return new Date(2026, +m[1] - 1, +m[2])
}

export function plateStatus(expiry) {
  if (!expiry) return null
  const now = new Date()
  const diff = (expiry - now) / 86400000
  if (diff < 0)  return 'expired'
  if (diff < 30) return 'soon'
  return 'ok'
}

// [id, plateInfo, appAccount, usage, location, notes]
export const VEHICLES_RAW = [
  ['E202-16#',        '临牌6.8过期',         'VIN:0056 吴世金(pro)',         'OTA测试·记忆泊车·有加热丝',         '深圳', '不适用冷启动测试'],
  ['E202-12#',        '临牌6.8过期',         'VIN:0055 苗志伟(pro)',         'APP泊车·有加热丝·集成专用·哨兵账号', '深圳', '不适用冷启动测试'],
  ['E202-10#',        '临牌4.10过期',        'VIN:0054 未知车主',            '闭口件·有加热丝',                   '深圳', '不适用集成/稳定性/冷启动'],
  ['E202-15#',        '临牌6.6过期',         'VIN:0856 苗志伟(pro)',         'APP泊车·支持冷启动测试',             '深圳', ''],
  ['E202-WH2715',     '',                    '',                             'P0 level',                          '长春', ''],
  ['E001-18',         '临牌6.30过期',        'VIN:5911 徐浪(uat)',           '遥控泊车·DVR',                      '深圳', ''],
  ['E001-20#',        '临牌3.30过期',        'VIN:6219 徐浪(pro)',           '事故车',                            '深圳', '不适用集成/稳定性/冷启动'],
  ['E001-客户WH2596', '',                    '',                             '',                                  '长春', ''],
  ['E009-10#',        '临牌4.30过期',        'VIN:9018 吴世金(uat)/徐浪(pro)','哑巴车·偏置泊车·可测APP(世金)',    '深圳', ''],
  ['E009-11#',        '临牌5.1过期',         'VIN:9012 徐浪(pro)',           '',                                  '深圳', ''],
  ['E009-16#',        '临牌5.1过期',         'VIN:6081 徐浪(pro)',           '集成/IA专用·TTE改制',               '深圳', '不适用稳定性/冷启动'],
  ['E009-客户2371',   '',                    '',                             '行、泊均正常',                       '长春', ''],
  ['E009-客户2612',   '',                    '',                             '行、泊均正常·支持车位到车位',         '长春', ''],
  ['E007-3#',         '临牌4.16过期',        'VIN:2031 徐浪(pro)',           '闭口件·无APP账号',                  '深圳', '不可用集成/稳定性/冷启动'],
  ['E007-8#',         '临牌5.28过期',        'VIN:1383 吴世金(pro)',         '遥控泊车·集成专用',                  '深圳', ''],
  ['E007-11#',        '临牌2.17过期',        'VIN:4769 徐浪(pro)',           'APP蓝牙钥匙不可用',                  '深圳', '不可用集成/稳定性/冷启动'],
  ['E007-客户2684',   '',                    '',                             'APP蓝牙钥匙不可用',                  '天津', ''],
  ['P301-9',          '临牌4.23过期',        '徐浪(pro)',                    '集成专用',                           '深圳', ''],
  ['P301-10',         '临牌4.23过期',        '徐浪(pro)',                    '主屏有概率不启动·需快捷重启',         '深圳', '拟测哨兵/智慧寻车/踢腿开门'],
  ['P301-5',          '临牌7.7过期',         '徐浪(uat)',                    'APP不可用·白屏已解决',               '深圳', '不可用于APP泊车/稳定性/集成'],
  ['P301-4',          '临牌7.7过期',         '徐浪(pro)',                    '预集成车辆',                         '深圳', ''],
  ['P301-3',          '临牌7.7过期',         '徐浪(uat)',                    '白屏',                              '长春', ''],
  ['P301-长春3070',   '临牌3.23过期',        '赵雨婷',                       '',                                  '长春', ''],
  ['P301-长春4105',   '临牌4.7过期',         '徐浪',                         '',                                  '长春', ''],
  ['P201-2',          '临牌4.23过期',        '李镜(uat)',                    'VIN:9577·APP可用',                  '深圳', ''],
  ['P201-3',          '临牌4.29过期',        '李镜(uat)',                    'VIN:0005·C样件不休眠',               '深圳', 'APP无法控车·需更换前保'],
  ['P201-4',          '临牌6.28过期',        '李镜(uat)',                    'VIN:2060',                          '深圳', '遥控泊车不可用'],
  ['P201-5',          '临牌6.11过期',        '李镜(uat)',                    'VIN:49585·C样件不休眠·无加热丝',    '深圳', 'APP无法控车'],
  ['P201-6',          '临牌4.23过期',        '李镜?(uat)',                   'VIN:01428·C样件不休眠·刹车盘过热',  '深圳', 'APP可用·哨兵可用'],
  ['P201-HJ4278',     '',                    '',                             '',                                  '长春', ''],
  ['P201-WH3283',     '',                    '',                             '电池故障维修中',                     '长春', '车辆不可用'],
  ['P201-HJ4285',     '',                    '',                             '',                                  '长春', ''],
  ['P567-3',          '临牌5.3到期',         '',                             '',                                  '深圳', ''],
  ['P567-4',          '临牌7.15到期',        '',                             '',                                  '深圳', ''],
  ['P567-WH4019',     '',                    '',                             '',                                  '长春', ''],
  ['P567-WH4013',     '',                    '',                             '',                                  '长春', ''],
  ['E202-10-1#',      '',                    '',                             '',                                  '深圳', ''],
  ['E202-10-2#',      '',                    '',                             '',                                  '深圳', ''],
  ['E202-10-2V3',     '',                    '',                             '',                                  '长春', ''],
  ['E202-10-3V9',     '',                    '',                             '',                                  '长春', ''],
]

export const VEHICLES = VEHICLES_RAW.map(([id, plate, app, usage, loc, notes]) => ({
  id,
  series: getSeries(id),
  app,
  usage,
  location: loc,
  notes,
  plateInfo: plate,
  plateExpiry: parsePlateExpiry(plate),
}))

export const SERIES_GROUPS = [...new Set(VEHICLES.map(v => v.series))]
