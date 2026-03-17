// 使用系统字体替代 Google Fonts，避免网络下载问题
// 如需使用 Google Fonts，请取消注释下方的导入和配置

// import {
//   Architects_Daughter,
//   DM_Sans,
//   Fira_Code,
//   Geist,
//   Geist_Mono,
//   Instrument_Sans,
//   Inter,
//   Mulish,
//   Noto_Sans_Mono,
//   Outfit,
//   Space_Mono
// } from 'next/font/google';

// 系统字体 CSS 变量
const fontSans = { variable: '--font-sans' };
const fontMono = { variable: '--font-mono' };
const fontInstrument = { variable: '--font-instrument' };
const fontNotoMono = { variable: '--font-noto-mono' };
const fontMullish = { variable: '--font-mullish' };
const fontInter = { variable: '--font-inter' };
const fontArchitectsDaughter = { variable: '--font-architects-daughter' };
const fontDMSans = { variable: '--font-dm-sans' };
const fontFiraCode = { variable: '--font-fira-code' };
const fontOutfit = { variable: '--font-outfit' };
const fontSpaceMono = { variable: '--font-space-mono' };

// Google Fonts 配置（已禁用）
// const fontSans = Geist({
//   subsets: ['latin'],
//   variable: '--font-sans'
// });

// const fontMono = Geist_Mono({
//   subsets: ['latin'],
//   variable: '--font-mono'
// });

// const fontInstrument = Instrument_Sans({
//   subsets: ['latin'],
//   variable: '--font-instrument'
// });

// const fontNotoMono = Noto_Sans_Mono({
//   subsets: ['latin'],
//   variable: '--font-noto-mono'
// });

// const fontMullish = Mulish({
//   subsets: ['latin'],
//   variable: '--font-mullish'
// });

// const fontInter = Inter({
//   subsets: ['latin'],
//   variable: '--font-inter'
// });

// const fontArchitectsDaughter = Architects_Daughter({
//   subsets: ['latin'],
//   weight: '400',
//   variable: '--font-architects-daughter'
// });

// const fontDMSans = DM_Sans({
//   subsets: ['latin'],
//   variable: '--font-dm-sans'
// });

// const fontFiraCode = Fira_Code({
//   subsets: ['latin'],
//   variable: '--font-fira-code'
// });

// const fontOutfit = Outfit({
//   subsets: ['latin'],
//   variable: '--font-outfit'
// });

// const fontSpaceMono = Space_Mono({
//   subsets: ['latin'],
//   weight: ['400', '700'],
//   variable: '--font-space-mono'
// });

// 系统字体回退配置
const systemFontVariables = [
  fontSans.variable,
  fontMono.variable,
  fontInstrument.variable,
  fontNotoMono.variable,
  fontMullish.variable,
  fontInter.variable,
  fontArchitectsDaughter.variable,
  fontDMSans.variable,
  fontFiraCode.variable,
  fontOutfit.variable,
  fontSpaceMono.variable
].join(' ');

export const fontVariables = systemFontVariables;
