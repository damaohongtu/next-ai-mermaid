import { EditorView } from '@codemirror/view';
import { Extension } from '@codemirror/state';
import { HighlightStyle, syntaxHighlighting } from '@codemirror/language';
import { tags as t } from '@lezer/highlight';

/**
 * Mermaid 深色主题样式
 */
const mermaidDarkHighlight = HighlightStyle.define([
  { tag: t.keyword, color: '#c678dd' },           // 紫色 - 图表类型和关键字
  { tag: t.propertyName, color: '#61afef' },      // 蓝色 - 属性和样式
  { tag: t.variableName, color: '#e06c75' },      // 红色 - 节点 ID
  { tag: t.string, color: '#98c379' },            // 绿色 - 字符串
  { tag: t.comment, color: '#5c6370', fontStyle: 'italic' }, // 灰色 - 注释
  { tag: t.number, color: '#d19a66' },            // 橙色 - 数字
  { tag: t.operator, color: '#56b6c2' },          // 青色 - 箭头和操作符
  { tag: t.punctuation, color: '#abb2bf' },       // 浅灰 - 标点
]);

/**
 * Mermaid 浅色主题样式
 */
const mermaidLightHighlight = HighlightStyle.define([
  { tag: t.keyword, color: '#a626a4' },           // 紫色 - 图表类型和关键字
  { tag: t.propertyName, color: '#0184bc' },      // 蓝色 - 属性和样式
  { tag: t.variableName, color: '#e45649' },      // 红色 - 节点 ID
  { tag: t.string, color: '#50a14f' },            // 绿色 - 字符串
  { tag: t.comment, color: '#a0a1a7', fontStyle: 'italic' }, // 灰色 - 注释
  { tag: t.number, color: '#c18401' },            // 橙色 - 数字
  { tag: t.operator, color: '#0997b3' },          // 青色 - 箭头和操作符
  { tag: t.punctuation, color: '#383a42' },       // 深灰 - 标点
]);

/**
 * Mermaid 编辑器深色主题
 */
export const mermaidDarkTheme = EditorView.theme({
  '&': {
    backgroundColor: '#1e293b',
    color: '#e2e8f0',
  },
  '.cm-content': {
    caretColor: '#61afef',
    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
  },
  '.cm-cursor, .cm-dropCursor': {
    borderLeftColor: '#61afef',
  },
  '&.cm-focused .cm-selectionBackground, .cm-selectionBackground, .cm-content ::selection': {
    backgroundColor: '#3e4451',
  },
  '.cm-activeLine': {
    backgroundColor: '#2c3e50',
  },
  '.cm-gutters': {
    backgroundColor: '#0f172a',
    color: '#64748b',
    border: 'none',
  },
  '.cm-activeLineGutter': {
    backgroundColor: '#2c3e50',
    color: '#e2e8f0',
  },
  '.cm-lineNumbers .cm-gutterElement': {
    padding: '0 8px 0 8px',
  },
  // Mermaid 特定样式
  '.cm-keyword': {
    fontWeight: 'bold',
  },
  '.cm-operator': {
    fontWeight: 'bold',
  },
}, { dark: true });

/**
 * Mermaid 编辑器浅色主题
 */
export const mermaidLightTheme = EditorView.theme({
  '&': {
    backgroundColor: '#ffffff',
    color: '#1f2937',
  },
  '.cm-content': {
    caretColor: '#0184bc',
    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
  },
  '.cm-cursor, .cm-dropCursor': {
    borderLeftColor: '#0184bc',
  },
  '&.cm-focused .cm-selectionBackground, .cm-selectionBackground, .cm-content ::selection': {
    backgroundColor: '#dbeafe',
  },
  '.cm-activeLine': {
    backgroundColor: '#f3f4f6',
  },
  '.cm-gutters': {
    backgroundColor: '#f9fafb',
    color: '#6b7280',
    border: 'none',
  },
  '.cm-activeLineGutter': {
    backgroundColor: '#f3f4f6',
    color: '#1f2937',
  },
  '.cm-lineNumbers .cm-gutterElement': {
    padding: '0 8px 0 8px',
  },
  // Mermaid 特定样式
  '.cm-keyword': {
    fontWeight: 'bold',
  },
  '.cm-operator': {
    fontWeight: 'bold',
  },
}, { dark: false });

/**
 * 获取 Mermaid 主题扩展
 */
export function getMermaidThemeExtensions(isDark: boolean): Extension[] {
  return [
    isDark ? mermaidDarkTheme : mermaidLightTheme,
    syntaxHighlighting(isDark ? mermaidDarkHighlight : mermaidLightHighlight),
  ];
}

