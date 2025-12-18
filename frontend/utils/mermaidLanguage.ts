import { StreamLanguage } from '@codemirror/language';
import { tags as t } from '@lezer/highlight';

/**
 * Mermaid 语法定义
 * 支持常见的 Mermaid 图表类型和语法
 */
export const mermaidLanguage = StreamLanguage.define({
  name: 'mermaid',
  
  startState: () => ({
    inString: false,
    stringDelim: null,
  }),

  token: (stream, state) => {
    // 处理字符串
    if (state.inString) {
      if (stream.match(state.stringDelim)) {
        state.inString = false;
        state.stringDelim = null;
        return 'string';
      }
      stream.next();
      return 'string';
    }

    // 跳过空白
    if (stream.eatSpace()) {
      return null;
    }

    // 注释
    if (stream.match(/%%.*$/)) {
      return 'comment';
    }

    // 字符串开始
    const stringMatch = stream.match(/["'`]/);
    if (stringMatch) {
      state.inString = true;
      state.stringDelim = stringMatch[0];
      return 'string';
    }

    // 图表类型声明（顶层关键字）
    if (stream.match(/^(graph|flowchart|sequenceDiagram|classDiagram|stateDiagram|stateDiagram-v2|erDiagram|gantt|journey|gitGraph|pie|quadrantChart|requirementDiagram|C4Context|C4Container|C4Component|C4Dynamic|C4Deployment|mindmap|timeline|zenuml|sankey-beta)\b/)) {
      return 'keyword';
    }

    // 方向关键字
    if (stream.match(/^(TB|TD|BT|RL|LR)\b/)) {
      return 'keyword';
    }

    // 图表方向和布局
    if (stream.match(/^(subgraph|end|direction)\b/)) {
      return 'keyword';
    }

    // 序列图关键字
    if (stream.match(/^(participant|actor|Note|activate|deactivate|loop|alt|else|opt|par|and|rect|autonumber|over|left of|right of)\b/)) {
      return 'keyword';
    }

    // 类图关键字
    if (stream.match(/^(class|namespace|interface|enum|annotation|abstract|static|public|private|protected|internal|external)\b/)) {
      return 'keyword';
    }

    // 状态图关键字
    if (stream.match(/^(state|note|fork|join|choice|concurrent)\b/)) {
      return 'keyword';
    }

    // ER 图关键字
    if (stream.match(/^(entity|relationship|identifies|only one|zero or one|one or more|zero or more|many)\b/)) {
      return 'keyword';
    }

    // 甘特图关键字
    if (stream.match(/^(title|dateFormat|axisFormat|section|excludes|includes|todayMarker|active|done|crit|milestone|after)\b/)) {
      return 'keyword';
    }

    // 用户旅程图关键字
    if (stream.match(/^(title|section|task)\b/)) {
      return 'keyword';
    }

    // Git 图关键字
    if (stream.match(/^(commit|branch|checkout|merge|cherry-pick|reset|revert|tag)\b/)) {
      return 'keyword';
    }

    // 饼图关键字
    if (stream.match(/^(title|showData)\b/)) {
      return 'keyword';
    }

    // 样式和主题
    if (stream.match(/^(style|classDef|class|linkStyle|fill|stroke|stroke-width|color|background|theme|themeVariables)\b/)) {
      return 'propertyName';
    }

    // 箭头和连接符
    if (stream.match(/-->|---|==>|===|-.->|-\.-|--o|--x|->>|-x|->|<->|<-->|o--o|x--x|\||\[|\]|\{|\}|\(|\)/)) {
      return 'operator';
    }

    // 序列图箭头
    if (stream.match(/->>\+|-->\+|->>\-|-->\-|->>|-->|-->>|--x|-x/)) {
      return 'operator';
    }

    // 节点 ID（字母数字和下划线）
    if (stream.match(/^[A-Za-z_][A-Za-z0-9_]*/)) {
      return 'variableName';
    }

    // 数字
    if (stream.match(/^[0-9]+/)) {
      return 'number';
    }

    // 冒号（标签分隔符）
    if (stream.match(/:/)) {
      return 'punctuation';
    }

    // 分号
    if (stream.match(/;/)) {
      return 'punctuation';
    }

    // 其他字符
    stream.next();
    return null;
  },

  languageData: {
    commentTokens: { line: '%%' },
  },
});

/**
 * Mermaid 语法高亮配置
 */
export const mermaidHighlighting = [
  { tag: t.keyword, class: 'cm-keyword' },
  { tag: t.propertyName, class: 'cm-property' },
  { tag: t.variableName, class: 'cm-variable' },
  { tag: t.string, class: 'cm-string' },
  { tag: t.comment, class: 'cm-comment' },
  { tag: t.number, class: 'cm-number' },
  { tag: t.operator, class: 'cm-operator' },
  { tag: t.punctuation, class: 'cm-punctuation' },
];

/**
 * 创建 Mermaid 语言支持
 */
export function mermaid() {
  return mermaidLanguage;
}

