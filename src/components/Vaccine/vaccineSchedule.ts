// 台灣兒童常規預防接種時程表
export interface VaccineTemplate {
  name: string;
  dose: string;
  monthAge: number; // 建議月齡
}

export const TW_VACCINE_SCHEDULE: VaccineTemplate[] = [
  { name: 'B型肝炎', dose: '第1劑', monthAge: 0 },
  { name: 'B型肝炎', dose: '第2劑', monthAge: 1 },
  { name: '五合一 (DTaP-Hib-IPV)', dose: '第1劑', monthAge: 2 },
  { name: '13價肺炎鏈球菌', dose: '第1劑', monthAge: 2 },
  { name: '五合一 (DTaP-Hib-IPV)', dose: '第2劑', monthAge: 4 },
  { name: '13價肺炎鏈球菌', dose: '第2劑', monthAge: 4 },
  { name: 'B型肝炎', dose: '第3劑', monthAge: 6 },
  { name: '五合一 (DTaP-Hib-IPV)', dose: '第3劑', monthAge: 6 },
  { name: '流感疫苗', dose: '第1劑', monthAge: 6 },
  { name: '水痘', dose: '第1劑', monthAge: 12 },
  { name: 'MMR (麻疹腮腺炎德國麻疹)', dose: '第1劑', monthAge: 12 },
  { name: '13價肺炎鏈球菌', dose: '第3劑', monthAge: 12 },
  { name: 'A型肝炎', dose: '第1劑', monthAge: 12 },
  { name: '日本腦炎', dose: '第1劑', monthAge: 15 },
  { name: '日本腦炎', dose: '第2劑', monthAge: 27 },
  { name: '五合一 (DTaP-Hib-IPV)', dose: '第4劑', monthAge: 18 },
  { name: 'A型肝炎', dose: '第2劑', monthAge: 18 },
  { name: 'MMR (麻疹腮腺炎德國麻疹)', dose: '第2劑', monthAge: 60 },
  { name: '日本腦炎', dose: '第3劑', monthAge: 63 },
  { name: '日本腦炎', dose: '第4劑', monthAge: 63 },
  { name: '減量破傷風白喉非細胞性百日咳及不活化小兒麻痺', dose: '追加', monthAge: 60 },
];

export const getScheduledDate = (birthday: string, monthAge: number): number => {
  const birth = new Date(birthday);
  const d = new Date(birth);
  d.setMonth(d.getMonth() + monthAge);
  return d.getTime();
};
