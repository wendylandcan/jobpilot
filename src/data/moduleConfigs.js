/**
 * 模块化引导对话配置
 * 每个模块定义：requiredFields、AI 人设、引导提示、Quick Reply chips、报告生成逻辑
 */

/* ── 侧栏 label → moduleKey 映射 ── */
export const LABEL_TO_MODULE = {
  '赔偿金计算器': 'compensation_calculator',
  '证据体检箱': 'evidence_checker',
  '博弈锦囊与话术': 'strategy_advisor',
  '合规风险扫描': 'compliance_scanner',
  '合同模板库': 'contract_templates',
  '沟通话术指南': 'communication_guide',
  '法规库检索': 'law_search',
  '证据整理工具': 'evidence_organizer',
};

/* ═══════════════════════════════════════════════
   赔偿金计算器
   ═══════════════════════════════════════════════ */
const compensationCalculator = {
  key: 'compensation_calculator',
  title: '赔偿金精准计算',
  subtitle: '计算顾问 · 自动计算',
  persona: '计算顾问',
  requiredFields: [
    {
      key: 'startDate',
      label: '入职日期',
      prompt: '请问您的入职日期是什么时候？（如：2023年1月15日）',
    },
    {
      key: 'endDate',
      label: '离职日期',
      prompt: '请问您的离职日期或预计离职日期是什么时候？',
    },
    {
      key: 'salary',
      label: '平均月薪',
      prompt:
        '为了算出准确金额，请问您过去12个月的平均月薪是多少（含奖金/补贴）？',
    },
    {
      key: 'reason',
      label: '离职原因',
      prompt: '请选择或描述您的离职原因：',
      chips: ['违法解除', '协商离职', '个人辞职', '经济性裁员', '合同到期不续签'],
    },
    {
      key: 'location',
      label: '所在地',
      prompt: '请问您的工作所在城市？（用于确定当地社会平均工资标准）',
      chips: ['北京', '上海', '广州', '深圳', '杭州', '成都'],
    },
  ],
  greeting:
    '您好，我是您的**计算顾问**。欢迎使用赔偿金精准计算器。\n\n为了给您准确的赔偿金计算结果，我需要依次收集以下信息：\n\n1. 入职日期\n2. 离职日期\n3. 过去12个月平均月薪（含奖金/补贴）\n4. 离职原因\n5. 工作所在城市\n\n我们开始吧——请问您的**入职日期**是什么时候？',
  parseInput(text, fields) {
    const updates = {};
    // Dates
    const dateRegex = /(\d{4})[年\-\/.](\d{1,2})[月\-\/.](\d{1,2})[日号]?/g;
    const dates = [...text.matchAll(dateRegex)].map(
      (m) => `${m[1]}年${m[2]}月${m[3]}日`
    );
    if (dates.length >= 2) {
      if (fields.startDate.status !== 'complete') updates.startDate = dates[0];
      if (fields.endDate.status !== 'complete') updates.endDate = dates[1];
    } else if (dates.length === 1) {
      if (fields.startDate.status !== 'complete') updates.startDate = dates[0];
      else if (fields.endDate.status !== 'complete') updates.endDate = dates[0];
    }
    // Salary
    const salaryMatch =
      text.match(/(\d[\d,]*)\s*[元块]/) ||
      text.match(/(?:月薪|工资|薪资|收入)[：:\s]*(\d[\d,]*)/) ||
      (fields.salary.status !== 'complete' && !dates.length && text.match(/^(\d{4,})$/m));
    if (salaryMatch && fields.salary.status !== 'complete') {
      updates.salary = salaryMatch[1].replace(/,/g, '') + '元';
    }
    // Reason
    const reasonMap = {
      '违法解除': ['违法', '开除', '辞退', '无正当'],
      '协商离职': ['协商'],
      '个人辞职': ['辞职', '主动离职', '个人原因'],
      '经济性裁员': ['裁员', '裁减'],
      '合同到期不续签': ['到期', '不续签'],
    };
    if (fields.reason.status !== 'complete') {
      for (const [reason, keywords] of Object.entries(reasonMap)) {
        if (keywords.some((kw) => text.includes(kw))) {
          updates.reason = reason;
          break;
        }
      }
    }
    // Location
    const cities = ['北京', '上海', '广州', '深圳', '杭州', '成都', '武汉', '南京', '苏州', '重庆', '天津', '西安', '郑州', '长沙', '东莞', '佛山', '合肥', '青岛', '沈阳', '济南'];
    if (fields.location.status !== 'complete') {
      for (const city of cities) {
        if (text.includes(city)) {
          updates.location = city;
          break;
        }
      }
    }
    return updates;
  },
  generateReport(fields) {
    const startStr = fields.startDate.value;
    const endStr = fields.endDate.value;
    const start = new Date(startStr.replace(/年|月/g, '-').replace(/日/, ''));
    const end = new Date(endStr.replace(/年|月/g, '-').replace(/日/, ''));
    const salaryNum = parseInt(fields.salary.value.replace(/[^\d]/g, ''), 10) || 0;
    const diffMs = end - start;
    const years = diffMs / (1000 * 60 * 60 * 24 * 365.25);
    const n = Math.max(0.5, Math.ceil(years * 2) / 2);
    const reason = fields.reason.value;
    const location = fields.location.value;

    let multiplier = 1;
    let reasonLabel = '经济补偿';
    if (reason.includes('违法')) {
      multiplier = 2;
      reasonLabel = '违法解除赔偿金（2N）';
    } else if (reason.includes('协商')) {
      reasonLabel = '协商解除经济补偿（N）';
    } else if (reason.includes('裁员')) {
      reasonLabel = '经济性裁员补偿（N）';
    } else if (reason.includes('辞职')) {
      multiplier = 0;
      reasonLabel = '劳动者主动辞职';
    } else if (reason.includes('到期')) {
      reasonLabel = '合同到期不续签补偿（N）';
    }

    const compensation = salaryNum * n;
    const total = compensation * multiplier;

    let r = `所有信息已补全，为您生成赔偿金分析报告：\n\n`;
    r += `**基本信息**\n`;
    r += `- 入职日期：${startStr}\n`;
    r += `- 离职日期：${endStr}\n`;
    r += `- 工作年限：约 ${n} 年\n`;
    r += `- 平均月薪：${salaryNum.toLocaleString()} 元\n`;
    r += `- 离职类型：${reason}\n`;
    r += `- 工作所在地：${location}\n\n`;
    r += `**计算依据**\n`;
    r += `根据《劳动合同法》第四十七条[2]，经济补偿按劳动者在本单位工作的年限，每满一年支付一个月工资。\n\n`;

    if (multiplier === 0) {
      r += `**计算结果**\n`;
      r += `劳动者主动辞职，一般情况下用人单位无需支付经济补偿。\n`;
      r += `但若用人单位存在《劳动合同法》第三十八条规定的过错情形（如未及时足额支付工资、未缴社保等），劳动者被迫辞职的，仍可主张经济补偿。`;
    } else {
      r += `**计算结果**\n`;
      r += `- 类型：${reasonLabel}\n`;
      r += `- 经济补偿（N）= ${n} × ${salaryNum.toLocaleString()} = **${compensation.toLocaleString()} 元**\n`;
      if (multiplier === 2) {
        r += `- 违法解除赔偿金（2N）= ${compensation.toLocaleString()} × 2 = **${total.toLocaleString()} 元**\n`;
        r += `\n依据：《劳动合同法》第八十七条[1]，用人单位违法解除劳动合同的，应当依照经济补偿标准的二倍支付赔偿金。`;
      }
    }

    r += `\n\n**建议**\n`;
    r += `1. 保留所有沟通记录（微信、短信、录音等）作为证据\n`;
    r += `2. 要求用人单位出具书面解除通知\n`;
    r += `3. 如协商不成，可向${location}劳动仲裁委申请仲裁（时效1年）`;

    return {
      content: r,
      analysisSteps: [
        { step: 1, title: '事实认定', content: `用户在该单位工作约${n}年，月薪${salaryNum.toLocaleString()}元，工作地点${location}。`, status: 'completed' },
        { step: 2, title: '法律关系分析', content: '双方存在事实劳动关系。用人单位单方解除需符合《劳动合同法》第三十九、四十、四十一条规定的法定情形。', status: 'completed', refIds: [4, 5, 6] },
        { step: 3, title: '违法性判定', content: `离职原因为"${reason}"，需判断是否符合法定解除条件。`, status: 'completed', refIds: [1] },
        { step: 4, title: '赔偿计算', content: `适用第47条/87条，经济补偿N=${n}，${multiplier === 2 ? '违法解除赔偿金2N=' + total.toLocaleString() + '元' : '补偿金=' + compensation.toLocaleString() + '元'}。`, status: 'completed', refIds: [1, 2] },
        { step: 5, title: '救济途径', content: `建议先行协商，协商不成可向${location}劳动仲裁委申请仲裁（时效1年），对裁决不服可向法院起诉。`, status: 'active', refIds: [3] },
      ],
      inlineCitations: [
        { id: 1, refId: 1, source: '北大法宝', type: 'authoritative', title: '《中华人民共和国劳动合同法》第八十七条', shortTitle: '劳动合同法 第87条', content: '用人单位违反本法规定解除或者终止劳动合同的，应当依照本法第四十七条规定的经济补偿标准的二倍向劳动者支付赔偿金。', highlightRange: '应当依照本法第四十七条规定的经济补偿标准的二倍向劳动者支付赔偿金', tag: '北大法宝', effectiveDate: '2008年1月1日起施行' },
        { id: 2, refId: 2, source: '北大法宝', type: 'authoritative', title: '《中华人民共和国劳动合同法》第四十七条', shortTitle: '劳动合同法 第47条', content: '经济补偿按劳动者在本单位工作的年限，每满一年支付一个月工资的标准向劳动者支付。六个月以上不满一年的，按一年计算；不满六个月的，向劳动者支付半个月工资的经济补偿。', highlightRange: '每满一年支付一个月工资的标准向劳动者支付', tag: '北大法宝', effectiveDate: '2008年1月1日起施行' },
        { id: 3, refId: 3, source: '北大法宝', type: 'authoritative', title: '《中华人民共和国劳动合同法》第五十条', shortTitle: '劳动合同法 第50条', content: '用人单位应当在解除或者终止劳动合同时出具解除或者终止劳动合同的证明，并在十五日内为劳动者办理档案和社会保险关系转移手续。', highlightRange: '应当在解除或者终止劳动合同时出具解除或者终止劳动合同的证明', tag: '北大法宝', effectiveDate: '2008年1月1日起施行' },
        { id: 4, refId: 4, source: '北大法宝', type: 'authoritative', title: '《中华人民共和国劳动合同法》第三十九条', shortTitle: '劳动合同法 第39条', content: '劳动者有下列情形之一的，用人单位可以解除劳动合同：（一）在试用期间被证明不符合录用条件的；（二）严重违反用人单位的规章制度的；（三）严重失职，营私舞弊，给用人单位造成重大损害的……', highlightRange: '劳动者有下列情形之一的，用人单位可以解除劳动合同', tag: '北大法宝', effectiveDate: '2008年1月1日起施行' },
        { id: 5, refId: 5, source: '北大法宝', type: 'authoritative', title: '《中华人民共和国劳动合同法》第四十条', shortTitle: '劳动合同法 第40条', content: '有下列情形之一的，用人单位提前三十日以书面形式通知劳动者本人或者额外支付劳动者一个月工资后，可以解除劳动合同……', highlightRange: '用人单位提前三十日以书面形式通知劳动者本人或者额外支付劳动者一个月工资后，可以解除劳动合同', tag: '北大法宝', effectiveDate: '2008年1月1日起施行' },
        { id: 6, refId: 6, source: '北大法宝', type: 'authoritative', title: '《中华人民共和国劳动合同法》第四十一条', shortTitle: '劳动合同法 第41条', content: '有下列情形之一，需要裁减人员二十人以上或者裁减不足二十人但占企业职工总数百分之十以上的，用人单位提前三十日向工会或者全体职工说明情况……', highlightRange: '用人单位提前三十日向工会或者全体职工说明情况', tag: '北大法宝', effectiveDate: '2008年1月1日起施行' },
      ],
    };
  },
};

/* ═══════════════════════════════════════════════
   证据体检箱
   ═══════════════════════════════════════════════ */
const evidenceChecker = {
  key: 'evidence_checker',
  title: '证据体检箱',
  subtitle: '证据合规官 · 风险排查',
  persona: '证据合规官',
  requiredFields: [
    {
      key: 'disputeType',
      label: '纠纷类型',
      prompt: '请选择或描述您面临的劳动纠纷类型：',
      chips: ['欠薪/克扣工资', '违法解除/辞退', '工伤认定', '社保争议', '竞业限制纠纷'],
    },
    {
      key: 'materials',
      label: '已有材料清单',
      prompt:
        '请告诉我您目前手上有哪些证据材料？（可多选或描述）',
      chips: ['劳动合同', '工资流水/银行记录', '考勤记录', '微信/短信聊天记录', '解除通知书', '社保缴纳记录'],
    },
    {
      key: 'originality',
      label: '证据原始性确认',
      prompt:
        '上述材料中，是否都是原件或原始截图？复印件、转述记录在仲裁中的证明力会降低。',
      chips: ['全部为原件/原始记录', '部分为复印件', '主要是口头/转述', '不确定'],
    },
  ],
  greeting:
    '您好，我是您的**证据合规官**。我将帮您检查现有证据是否完整、合规，并识别关键缺失。\n\n我需要了解以下信息：\n1. 您面临的纠纷类型\n2. 目前手上的证据材料\n3. 材料的原始性情况\n\n首先——请选择您面临的**纠纷类型**：',
  parseInput(text, fields) {
    const updates = {};
    // Dispute type
    const disputeMap = {
      '欠薪/克扣工资': ['欠薪', '克扣', '拖欠工资', '少发', '未发工资'],
      '违法解除/辞退': ['解除', '辞退', '开除', '辞退', '被开'],
      '工伤认定': ['工伤', '受伤', '工作受伤'],
      '社保争议': ['社保', '公积金', '未缴'],
      '竞业限制纠纷': ['竞业', '竞业限制', '竞业协议'],
    };
    if (fields.disputeType.status !== 'complete') {
      for (const [type, keywords] of Object.entries(disputeMap)) {
        if (keywords.some((kw) => text.includes(kw))) {
          updates.disputeType = type;
          break;
        }
      }
    }
    // Materials — broad match
    const materialKeywords = ['合同', '工资', '流水', '银行', '考勤', '微信', '短信', '聊天', '通知', '社保', '录音', '邮件', '照片'];
    if (fields.materials.status !== 'complete') {
      const found = materialKeywords.filter((kw) => text.includes(kw));
      if (found.length > 0) updates.materials = text;
    }
    // Originality
    const origKeywords = { '全部为原件/原始记录': ['原件', '原始', '全部'], '部分为复印件': ['复印', '部分'], '主要是口头/转述': ['口头', '转述'], '不确定': ['不确定', '不清楚'] };
    if (fields.originality.status !== 'complete') {
      for (const [label, kws] of Object.entries(origKeywords)) {
        if (kws.some((kw) => text.includes(kw))) {
          updates.originality = label;
          break;
        }
      }
    }
    return updates;
  },
  generateReport(fields) {
    const disputeType = fields.disputeType.value;
    const materials = fields.materials.value;
    const originality = fields.originality.value;

    const isOriginal = originality.includes('原件');
    const hasContract = materials.includes('合同');
    const hasPayRecord = materials.includes('工资') || materials.includes('流水') || materials.includes('银行');
    const hasAttendance = materials.includes('考勤');
    const hasChatRecord = materials.includes('微信') || materials.includes('短信') || materials.includes('聊天');

    let r = `证据体检报告已生成：\n\n`;
    r += `**纠纷类型**：${disputeType}\n`;
    r += `**证据原始性**：${originality}\n\n`;
    r += `**证据完备性评估**\n`;
    r += `- 劳动合同：${hasContract ? '✅ 已有' : '❌ 缺失 — **关键证据！** 可用入职登记、工牌、社保记录替代证明劳动关系'}\n`;
    r += `- 工资/收入记录：${hasPayRecord ? '✅ 已有' : '❌ 缺失 — 建议打印近12个月银行工资流水'}\n`;
    r += `- 考勤记录：${hasAttendance ? '✅ 已有' : '⚠️ 缺失 — 加班费争议中为关键证据，建议截图保存'}\n`;
    r += `- 沟通记录：${hasChatRecord ? '✅ 已有' : '⚠️ 缺失 — 与HR/领导的沟通记录可作为重要辅助证据'}\n\n`;

    if (!isOriginal) {
      r += `**⚠️ 原始性风险提醒**\n`;
      r += `您的部分材料非原件，根据《最高人民法院关于民事诉讼证据的若干规定》第九十条，复印件在无法与原件核对的情况下，不能单独作为认定案件事实的根据。建议尽量获取原件或经公证的副本。\n\n`;
    }

    r += `**下一步建议**\n`;
    r += `1. 优先补全标记为"❌"的缺失证据\n`;
    r += `2. 所有电子证据建议进行时间戳公证\n`;
    r += `3. 整理证据清单后可进入「赔偿金计算器」精算金额`;

    return {
      content: r,
      analysisSteps: [
        { step: 1, title: '纠纷定性', content: `用户面临的纠纷类型为：${disputeType}。`, status: 'completed' },
        { step: 2, title: '证据盘点', content: `用户已有材料：${materials}。需评估完备性。`, status: 'completed' },
        { step: 3, title: '完备性分析', content: `对照${disputeType}案件所需核心证据清单，逐项检查用户材料。`, status: 'completed' },
        { step: 4, title: '原始性评估', content: `证据原始性为"${originality}"，影响仲裁/诉讼中的证明力。`, status: 'completed' },
        { step: 5, title: '补全建议', content: '针对缺失证据给出替代方案和取证策略。', status: 'active' },
      ],
      inlineCitations: [
        { id: 1, refId: 1, source: '北大法宝', type: 'authoritative', title: '《最高人民法院关于民事诉讼证据的若干规定》第九十条', shortTitle: '民诉证据规定 第90条', content: '下列证据不能单独作为认定案件事实的根据：（五）无法与原件、原物核对的复制件、复制品。', highlightRange: '无法与原件、原物核对的复制件、复制品', tag: '北大法宝', effectiveDate: '2020年5月1日起施行' },
        { id: 2, refId: 2, source: '北大法宝', type: 'authoritative', title: '《劳动争议调解仲裁法》第六条', shortTitle: '劳动仲裁法 第6条', content: '发生劳动争议，当事人对自己提出的主张，有责任提供证据。与争议事项有关的证据属于用人单位掌握管理的，用人单位应当提供；用人单位不提供的，应当承担不利后果。', highlightRange: '与争议事项有关的证据属于用人单位掌握管理的，用人单位应当提供', tag: '北大法宝', effectiveDate: '2008年5月1日起施行' },
      ],
    };
  },
};

/* ═══════════════════════════════════════════════
   博弈锦囊与话术
   ═══════════════════════════════════════════════ */
const strategyAdvisor = {
  key: 'strategy_advisor',
  title: '博弈锦囊与话术',
  subtitle: '谈判策略家 · 实战模拟',
  persona: '谈判策略家',
  requiredFields: [
    {
      key: 'targetPerson',
      label: '对话对象',
      prompt: '您即将与谁进行沟通或谈判？',
      chips: ['HR/人事', '直属领导/上级', '公司法务', '老板/高管'],
    },
    {
      key: 'currentStage',
      label: '当前阶段',
      prompt: '您目前处于哪个阶段？',
      chips: ['收到口头通知', '正在谈话协商中', '已收到书面通知', '已离职/准备仲裁'],
    },
    {
      key: 'coreDemand',
      label: '核心诉求',
      prompt: '您最希望达成的结果是什么？',
      chips: ['争取最大赔偿', '保住工作岗位', '协商体面离职', '获取离职证明/社保转移'],
    },
    {
      key: 'hasEvidence',
      label: '核心证据',
      prompt:
        '**重要提醒**：在给出话术策略前，我需要确认——您目前是否掌握以下任一核心证据？\n\n这将直接影响谈判策略的强硬程度。',
      chips: ['有劳动合同', '有工资流水记录', '有沟通录音/截图', '暂无实质性证据'],
    },
  ],
  greeting:
    '您好，我是您的**谈判策略家**。我将根据您的具体情况，提供实战话术和博弈策略。\n\n在给出建议前，我需要了解：\n1. 您的对话对象\n2. 当前所处阶段\n3. 核心诉求\n4. 手上的核心证据\n\n首先——您即将与谁进行沟通？',
  parseInput(text, fields) {
    const updates = {};
    // Target person
    const targetMap = {
      'HR/人事': ['HR', 'hr', '人事', '人力'],
      '直属领导/上级': ['领导', '上级', '经理', '主管', '老大'],
      '公司法务': ['法务', '律师'],
      '老板/高管': ['老板', '总监', '高管', '董事', '总经理'],
    };
    if (fields.targetPerson.status !== 'complete') {
      for (const [label, kws] of Object.entries(targetMap)) {
        if (kws.some((kw) => text.toLowerCase().includes(kw.toLowerCase()))) {
          updates.targetPerson = label;
          break;
        }
      }
    }
    // Stage
    const stageMap = {
      '收到口头通知': ['口头', '口头通知', '叫我走'],
      '正在谈话协商中': ['协商', '谈话', '谈判', '沟通中', '正在谈'],
      '已收到书面通知': ['书面', '正式通知', '解除通知'],
      '已离职/准备仲裁': ['已离职', '仲裁', '已经走了', '准备仲裁'],
    };
    if (fields.currentStage.status !== 'complete') {
      for (const [label, kws] of Object.entries(stageMap)) {
        if (kws.some((kw) => text.includes(kw))) {
          updates.currentStage = label;
          break;
        }
      }
    }
    // Core demand
    const demandMap = {
      '争取最大赔偿': ['赔偿', '最大赔偿', '多拿钱', '补偿金'],
      '保住工作岗位': ['保住', '不想走', '留下', '继续工作'],
      '协商体面离职': ['体面', '好聚好散', '协商离职'],
      '获取离职证明/社保转移': ['离职证明', '社保', '转移'],
    };
    if (fields.coreDemand.status !== 'complete') {
      for (const [label, kws] of Object.entries(demandMap)) {
        if (kws.some((kw) => text.includes(kw))) {
          updates.coreDemand = label;
          break;
        }
      }
    }
    // Evidence
    const evidMap = {
      '有劳动合同': ['合同'],
      '有工资流水记录': ['工资', '流水', '银行'],
      '有沟通录音/截图': ['录音', '截图', '录像'],
      '暂无实质性证据': ['没有证据', '暂无', '啥都没有'],
    };
    if (fields.hasEvidence.status !== 'complete') {
      for (const [label, kws] of Object.entries(evidMap)) {
        if (kws.some((kw) => text.includes(kw))) {
          updates.hasEvidence = label;
          break;
        }
      }
    }
    return updates;
  },
  generateReport(fields) {
    const target = fields.targetPerson.value;
    const stage = fields.currentStage.value;
    const demand = fields.coreDemand.value;
    const evidence = fields.hasEvidence.value;
    const hasStrongEvidence = !evidence.includes('暂无');

    let r = `博弈策略报告已生成：\n\n`;
    r += `**场景分析**\n`;
    r += `- 对话对象：${target}\n`;
    r += `- 当前阶段：${stage}\n`;
    r += `- 核心诉求：${demand}\n`;
    r += `- 证据状况：${evidence}\n\n`;

    r += `**整体策略**：${hasStrongEvidence ? '**攻守兼备**——您有核心证据在手，可以适度强硬' : '**以守为攻**——当前证据不足，建议先收集证据再谈判'}\n\n`;

    r += `**话术锦囊**\n\n`;

    if (demand.includes('赔偿')) {
      r += `**开场话术**（面对${target}）：\n`;
      r += `> "关于解除劳动关系这件事，我希望我们能依法依规地处理。我了解《劳动合同法》对这种情况有明确的规定，我希望公司能按法律标准给予合理的经济补偿。"\n\n`;
      r += `**关键话术**：\n`;
      r += `> "如果公司的方案低于法定标准，我可能需要通过劳动仲裁来维护自己的权益。当然，我更希望双方能友好协商解决。"\n\n`;
    } else if (demand.includes('保住')) {
      r += `**开场话术**：\n`;
      r += `> "我非常重视这份工作，希望能有机会继续为公司贡献。如果是工作表现的问题，我愿意接受培训和改进。"\n\n`;
    } else if (demand.includes('体面')) {
      r += `**开场话术**：\n`;
      r += `> "我理解公司的决定。我希望我们能友好地处理好交接，同时请公司按法律规定给予应有的经济补偿和离职手续。"\n\n`;
    }

    if (!hasStrongEvidence) {
      r += `**⚠️ 证据策略**\n`;
      r += `您当前证据不足，建议：\n`;
      r += `1. 谈判前先用手机录音（单方录音合法）\n`;
      r += `2. 要求公司以书面/微信形式确认解除原因\n`;
      r += `3. 打印近12个月银行工资流水\n`;
      r += `4. **切勿在协议上签字**，直到您充分了解自己的权益\n\n`;
    }

    r += `**红线提醒**\n`;
    r += `- 不要情绪化、不要威胁，保持专业\n`;
    r += `- 不要主动提出辞职（会丧失经济补偿资格）\n`;
    r += `- 所有沟通尽量保留书面记录`;

    return {
      content: r,
      analysisSteps: [
        { step: 1, title: '场景评估', content: `对话对象为${target}，当前处于"${stage}"阶段。`, status: 'completed' },
        { step: 2, title: '证据盘点', content: `用户证据状况：${evidence}。${hasStrongEvidence ? '具备谈判基础' : '证据不足，需先行收集'}。`, status: 'completed' },
        { step: 3, title: '策略制定', content: `核心诉求为"${demand}"，结合证据状况制定${hasStrongEvidence ? '攻守兼备' : '以守为攻'}策略。`, status: 'completed' },
        { step: 4, title: '话术生成', content: '根据对话对象和诉求，生成开场白、关键话术和应对策略。', status: 'completed' },
        { step: 5, title: '风险警示', content: '标注谈判红线，提醒注意事项和关键法律时效。', status: 'active' },
      ],
      inlineCitations: [
        { id: 1, refId: 1, source: '北大法宝', type: 'authoritative', title: '《中华人民共和国劳动合同法》第三十八条', shortTitle: '劳动合同法 第38条', content: '用人单位有下列情形之一的，劳动者可以解除劳动合同：（一）未按照劳动合同约定提供劳动保护或者劳动条件的；（二）未及时足额支付劳动报酬的；（三）未依法为劳动者缴纳社会保险费的……', highlightRange: '劳动者可以解除劳动合同', tag: '北大法宝', effectiveDate: '2008年1月1日起施行' },
        { id: 2, refId: 2, source: '北大法宝', type: 'authoritative', title: '《中华人民共和国劳动争议调解仲裁法》第二十七条', shortTitle: '劳动仲裁法 第27条', content: '劳动争议申请仲裁的时效期间为一年。仲裁时效期间从当事人知道或者应当知道其权利被侵害之日起计算。', highlightRange: '劳动争议申请仲裁的时效期间为一年', tag: '北大法宝', effectiveDate: '2008年5月1日起施行' },
      ],
    };
  },
};

/* ═══════════════════════════════════════════════
   合规风险扫描（用工者）
   ═══════════════════════════════════════════════ */
const complianceScanner = {
  key: 'compliance_scanner',
  title: '合规风险扫描',
  subtitle: '合规风控官 · 风险排查',
  persona: '合规风控官',
  requiredFields: [
    {
      key: 'businessStage',
      label: '业务阶段',
      prompt: '您好，我是您的合规风控官。为了进行精准扫描，请告知该风险涉及的**用工阶段**：',
      chips: ['招聘入职', '在职管理', '解除/终止劳动关系'],
    },
    {
      key: 'riskPoint',
      label: '具体风险点',
      prompt: '请描述或选择您关注的**具体风险点**：',
      chips: ['加班管理', '社保缴纳', '规章制度合规', '劳务派遣', '工伤处理'],
    },
    {
      key: 'existingPolicy',
      label: '现有内部制度',
      prompt: '请简要描述贵公司目前针对该风险点的**处理方式或内部制度**（如有），以便我评估合规水平。',
      chips: ['已有书面制度', '有制度但未公示', '口头约定', '暂无制度'],
    },
  ],
  greeting:
    '您好，我是您的**合规风控官**。为了进行精准扫描，请告知该风险涉及的用工阶段及目前公司的处理方式。\n\n我需要了解：\n1. 业务阶段（招聘/在职管理/解除关系）\n2. 具体风险点\n3. 公司现有的相关内部制度\n\n首先——请选择涉及的**用工阶段**：',
  parseInput(text, fields) {
    const updates = {};
    const stageMap = {
      '招聘入职': ['招聘', '入职', '面试', '录用', '试用'],
      '在职管理': ['在职', '管理', '加班', '考勤', '调岗', '培训'],
      '解除/终止劳动关系': ['解除', '终止', '辞退', '裁员', '离职'],
    };
    if (fields.businessStage.status !== 'complete') {
      for (const [label, kws] of Object.entries(stageMap)) {
        if (kws.some((kw) => text.includes(kw))) { updates.businessStage = label; break; }
      }
    }
    const riskMap = {
      '加班管理': ['加班', '超时', '工时'],
      '社保缴纳': ['社保', '公积金', '未缴', '少缴'],
      '规章制度合规': ['规章', '制度', '员工手册'],
      '劳务派遣': ['派遣', '劳务'],
      '工伤处理': ['工伤', '受伤', '安全'],
    };
    if (fields.riskPoint.status !== 'complete') {
      for (const [label, kws] of Object.entries(riskMap)) {
        if (kws.some((kw) => text.includes(kw))) { updates.riskPoint = label; break; }
      }
    }
    const policyMap = {
      '已有书面制度': ['书面', '成文', '有制度'],
      '有制度但未公示': ['未公示', '没公示', '没告知'],
      '口头约定': ['口头', '约定'],
      '暂无制度': ['没有', '暂无', '无制度'],
    };
    if (fields.existingPolicy.status !== 'complete') {
      for (const [label, kws] of Object.entries(policyMap)) {
        if (kws.some((kw) => text.includes(kw))) { updates.existingPolicy = label; break; }
      }
    }
    return updates;
  },
  generateReport(fields) {
    const stage = fields.businessStage.value;
    const risk = fields.riskPoint.value;
    const policy = fields.existingPolicy.value;
    const hasPolicy = policy.includes('书面');

    let r = `合规风险扫描报告已生成：\n\n`;
    r += `**扫描概要**\n`;
    r += `- 业务阶段：${stage}\n`;
    r += `- 风险领域：${risk}\n`;
    r += `- 制度现状：${policy}\n\n`;

    r += `**风险评估**\n`;
    if (!hasPolicy) {
      r += `- ⚠️ **高风险**：贵公司在"${risk}"领域${policy === '暂无制度' ? '缺乏内部制度' : '制度存在瑕疵'}，一旦发生劳动争议，用人单位将承担举证不能的不利后果。\n`;
      r += `- 依据：《劳动合同法》第四条[1]要求用人单位应当依法建立和完善劳动规章制度。\n\n`;
    } else {
      r += `- ✅ **中低风险**：贵公司已有书面制度，但仍需确认是否经过民主程序制定并向劳动者公示。\n\n`;
    }

    r += `**合规建议**\n`;
    r += `1. ${hasPolicy ? '审查现有制度的制定程序（是否经职工代表大会讨论）及公示记录' : '立即建立书面规章制度，并保留经民主程序制定的会议记录'}\n`;
    r += `2. 确保相关制度已向全体员工公示（建议签收确认或OA系统公告+已读记录）\n`;
    r += `3. 定期对照最新法规进行制度更新，保留修订记录`;

    return {
      content: r,
      analysisSteps: [
        { step: 1, title: '阶段识别', content: `用工阶段为"${stage}"，锁定该阶段高发风险。`, status: 'completed' },
        { step: 2, title: '风险定位', content: `核心风险点为"${risk}"，检查相关法律法规要求。`, status: 'completed' },
        { step: 3, title: '制度评估', content: `现有制度状况为"${policy}"，评估合规水平。`, status: 'completed', refIds: [1] },
        { step: 4, title: '风险定级', content: `综合评估风险等级，${hasPolicy ? '中低风险' : '高风险'}。`, status: 'completed' },
        { step: 5, title: '整改建议', content: '给出分步整改方案和时间节点建议。', status: 'active', refIds: [1, 2] },
      ],
      inlineCitations: [
        { id: 1, refId: 1, source: '北大法宝', type: 'authoritative', title: '《中华人民共和国劳动合同法》第四条', shortTitle: '劳动合同法 第4条', content: '用人单位应当依法建立和完善劳动规章制度，保障劳动者享有劳动权利、履行劳动义务。用人单位在制定、修改或者决定有关劳动报酬、工作时间、休息休假、劳动安全卫生、保险福利、职工培训、劳动纪律以及劳动定额管理等直接涉及劳动者切身利益的规章制度或者重大事项时，应当经职工代表大会或者全体职工讨论……', highlightRange: '应当经职工代表大会或者全体职工讨论', tag: '北大法宝', effectiveDate: '2008年1月1日起施行' },
        { id: 2, refId: 2, source: '北大法宝', type: 'authoritative', title: '《最高人民法院关于审理劳动争议案件适用法律问题的解释（一）》第五十条', shortTitle: '劳动争议司法解释(一) 第50条', content: '用人单位根据劳动合同法第四条规定，通过民主程序制定的规章制度，不违反国家法律、行政法规及政策规定，并已向劳动者公示的，可以作为确定双方权利义务的依据。', highlightRange: '通过民主程序制定的规章制度', tag: '北大法宝', effectiveDate: '2021年1月1日起施行' },
      ],
    };
  },
};

/* ═══════════════════════════════════════════════
   合同模板库（用工者）
   ═══════════════════════════════════════════════ */
const contractTemplates = {
  key: 'contract_templates',
  title: '合同模板库',
  subtitle: '法律文书专家 · 模板定制',
  persona: '法律文书专家',
  requiredFields: [
    {
      key: 'employeeType',
      label: '员工类型',
      prompt: '请告诉我您需要的**员工身份类型**：',
      chips: ['全日制', '劳务关系', '实习', '劳务派遣'],
    },
    {
      key: 'industry',
      label: '行业及岗位',
      prompt: '请描述**所属行业及岗位性质**（如：互联网-研发岗、制造业-生产线工人等）：',
      chips: ['互联网/IT', '制造业', '金融行业', '教育培训', '餐饮服务'],
    },
    {
      key: 'specialClauses',
      label: '特殊条款需求',
      prompt: '是否有以下**特殊条款**需求？（可多选或描述）',
      chips: ['竞业限制', '知识产权归属', '保密协议', '服务期约定', '无需特殊条款'],
    },
  ],
  greeting:
    '您好，我是您的**法律文书专家**。我将帮您生成符合监管要求的劳动合同模板。\n\n请告诉我您需要的员工身份类型（全日制或劳务）以及是否有特殊的保密或竞业限制要求。\n\n我需要确认：\n1. 员工类型\n2. 行业及岗位性质\n3. 特殊条款需求\n\n首先——请选择**员工类型**：',
  parseInput(text, fields) {
    const updates = {};
    const typeMap = {
      '全日制': ['全日制', '正式', '全职'],
      '劳务关系': ['劳务', '兼职', '退休返聘'],
      '实习': ['实习', '实习生'],
      '劳务派遣': ['派遣', '劳务派遣'],
    };
    if (fields.employeeType.status !== 'complete') {
      for (const [label, kws] of Object.entries(typeMap)) {
        if (kws.some((kw) => text.includes(kw))) { updates.employeeType = label; break; }
      }
    }
    const industryMap = {
      '互联网/IT': ['互联网', 'IT', '软件', '科技', '研发', '程序'],
      '制造业': ['制造', '工厂', '生产', '车间'],
      '金融行业': ['金融', '银行', '保险', '证券'],
      '教育培训': ['教育', '培训', '学校', '老师'],
      '餐饮服务': ['餐饮', '服务', '酒店', '外卖'],
    };
    if (fields.industry.status !== 'complete') {
      for (const [label, kws] of Object.entries(industryMap)) {
        if (kws.some((kw) => text.includes(kw))) { updates.industry = label; break; }
      }
      // Fallback: accept free text if no match but input is substantive
      if (!updates.industry && text.length >= 4) updates.industry = text;
    }
    const clauseMap = {
      '竞业限制': ['竞业'],
      '知识产权归属': ['知识产权', '专利', '发明'],
      '保密协议': ['保密', 'NDA'],
      '服务期约定': ['服务期', '培训服务期'],
      '无需特殊条款': ['不需要', '无需', '没有特殊'],
    };
    if (fields.specialClauses.status !== 'complete') {
      for (const [label, kws] of Object.entries(clauseMap)) {
        if (kws.some((kw) => text.includes(kw))) { updates.specialClauses = label; break; }
      }
    }
    return updates;
  },
  generateReport(fields) {
    const type = fields.employeeType.value;
    const industry = fields.industry.value;
    const clause = fields.specialClauses.value;
    const hasSpecial = !clause.includes('无需');

    let r = `合同模板方案已生成：\n\n`;
    r += `**需求摘要**\n`;
    r += `- 员工类型：${type}\n`;
    r += `- 行业/岗位：${industry}\n`;
    r += `- 特殊条款：${clause}\n\n`;

    r += `**推荐合同框架**\n`;
    if (type === '全日制') {
      r += `适用《劳动合同法》标准劳动合同，必备条款包括：\n`;
      r += `- 合同期限（固定/无固定期限）及试用期\n`;
      r += `- 工作内容、地点、时间、休息休假\n`;
      r += `- 劳动报酬及支付方式\n`;
      r += `- 社会保险及福利待遇\n`;
    } else if (type === '劳务关系') {
      r += `⚠️ 劳务关系不适用《劳动合同法》，适用《民法典》合同编。建议签订**劳务协议**而非劳动合同。\n`;
    } else if (type === '实习') {
      r += `⚠️ 在校实习生不建立劳动关系，建议签订**实习协议**，明确实习补贴、工伤保险等。\n`;
    } else {
      r += `劳务派遣需签订**派遣协议**，确保"同工同酬"及派遣比例不超过用工总量10%。\n`;
    }

    if (hasSpecial) {
      r += `\n**特殊条款要点**\n`;
      if (clause.includes('竞业')) {
        r += `- 竞业限制：期限不超过2年，须按月支付不低于离职前12个月平均工资30%的经济补偿[1]\n`;
      }
      if (clause.includes('保密')) {
        r += `- 保密协议：明确保密范围、保密期限及违约责任\n`;
      }
      if (clause.includes('知识产权')) {
        r += `- 知识产权：职务发明归属单位，需在合同中明确约定\n`;
      }
      if (clause.includes('服务期')) {
        r += `- 服务期：仅限专项培训费用场景，违约金不超过培训费用[2]\n`;
      }
    }

    r += `\n\n**注意事项**\n`;
    r += `1. 合同一式两份，一份交付劳动者\n`;
    r += `2. 自用工之日起一个月内必须签订书面合同\n`;
    r += `3. 保留签收记录作为合规证据`;

    return {
      content: r,
      analysisSteps: [
        { step: 1, title: '用工形式判定', content: `员工类型为"${type}"，确定适用的法律框架。`, status: 'completed' },
        { step: 2, title: '行业合规审查', content: `行业为"${industry}"，检查行业特殊监管要求。`, status: 'completed' },
        { step: 3, title: '必备条款校验', content: '对照《劳动合同法》第十七条，确保九项必备条款完整。', status: 'completed', refIds: [1] },
        { step: 4, title: '特殊条款起草', content: `${hasSpecial ? '依据用户需求起草' + clause + '条款' : '无特殊条款需求'}。`, status: 'completed', refIds: hasSpecial ? [1, 2] : [] },
        { step: 5, title: '风险提示', content: '标注合同签订时间要求及送达留痕建议。', status: 'active' },
      ],
      inlineCitations: [
        { id: 1, refId: 1, source: '北大法宝', type: 'authoritative', title: '《中华人民共和国劳动合同法》第二十三条、第二十四条', shortTitle: '劳动合同法 第23-24条', content: '用人单位与劳动者可以在劳动合同中约定保守用人单位的商业秘密和与知识产权相关的保密事项。对负有保密义务的劳动者，用人单位可以在劳动合同或者保密协议中与劳动者约定竞业限制条款。竞业限制期限，不得超过二年。', highlightRange: '竞业限制期限，不得超过二年', tag: '北大法宝', effectiveDate: '2008年1月1日起施行' },
        { id: 2, refId: 2, source: '北大法宝', type: 'authoritative', title: '《中华人民共和国劳动合同法》第二十二条', shortTitle: '劳动合同法 第22条', content: '用人单位为劳动者提供专项培训费用，对其进行专业技术培训的，可以与该劳动者订立协议，约定服务期。劳动者违反服务期约定的，应当按照约定向用人单位支付违约金。违约金的数额不得超过用人单位提供的培训费用。', highlightRange: '违约金的数额不得超过用人单位提供的培训费用', tag: '北大法宝', effectiveDate: '2008年1月1日起施行' },
      ],
    };
  },
};

/* ═══════════════════════════════════════════════
   沟通话术指南（用工者）
   ═══════════════════════════════════════════════ */
const communicationGuide = {
  key: 'communication_guide',
  title: '沟通话术指南',
  subtitle: '资深HR顾问 · 话术模拟',
  persona: '资深HR顾问',
  requiredFields: [
    {
      key: 'targetEmployee',
      label: '沟通对象',
      prompt: '请描述**沟通对象**的基本信息（岗位、工龄等）：',
      chips: ['管理层/主管', '普通员工（1-3年）', '资深员工（5年以上）', '试用期员工'],
    },
    {
      key: 'scenario',
      label: '沟通场景',
      prompt: '请选择您面临的**沟通场景**：',
      chips: ['绩效约谈', '协商解除', '纪律处分', '劳动合同续签'],
    },
    {
      key: 'coreDemand',
      label: '核心诉求',
      prompt: '您希望本次沟通达成的**核心目标**是什么？',
      chips: ['达成协商解除', '督促绩效改进', '合规出具处分', '挽留核心员工'],
    },
  ],
  greeting:
    '您好，我是您的**资深HR顾问**。我将帮您准备沟通话术，防止言语不当造成取证隐患。\n\n请告诉我：\n1. 沟通对象（岗位、工龄）\n2. 沟通场景\n3. 核心诉求\n\n首先——请描述**沟通对象**的基本情况：',
  parseInput(text, fields) {
    const updates = {};
    const targetMap = {
      '管理层/主管': ['管理', '主管', '经理', '总监'],
      '普通员工（1-3年）': ['普通员工', '初级', '新员工'],
      '资深员工（5年以上）': ['资深', '老员工', '5年', '十年', '多年'],
      '试用期员工': ['试用', '试用期'],
    };
    if (fields.targetEmployee.status !== 'complete') {
      for (const [label, kws] of Object.entries(targetMap)) {
        if (kws.some((kw) => text.includes(kw))) { updates.targetEmployee = label; break; }
      }
      if (!updates.targetEmployee && text.length >= 3) updates.targetEmployee = text;
    }
    const sceneMap = {
      '绩效约谈': ['绩效', '考核', 'KPI', '不达标'],
      '协商解除': ['协商', '解除', '离职', '辞退'],
      '纪律处分': ['处分', '违纪', '迟到', '旷工', '纪律'],
      '劳动合同续签': ['续签', '续约', '合同到期'],
    };
    if (fields.scenario.status !== 'complete') {
      for (const [label, kws] of Object.entries(sceneMap)) {
        if (kws.some((kw) => text.includes(kw))) { updates.scenario = label; break; }
      }
    }
    const demandMap = {
      '达成协商解除': ['协商解除', '好聚好散', '和平分手'],
      '督促绩效改进': ['改进', '提升', '整改', 'PIP'],
      '合规出具处分': ['处分', '警告', '记过'],
      '挽留核心员工': ['挽留', '留住', '不想走'],
    };
    if (fields.coreDemand.status !== 'complete') {
      for (const [label, kws] of Object.entries(demandMap)) {
        if (kws.some((kw) => text.includes(kw))) { updates.coreDemand = label; break; }
      }
    }
    return updates;
  },
  generateReport(fields) {
    const target = fields.targetEmployee.value;
    const scenario = fields.scenario.value;
    const demand = fields.coreDemand.value;

    let r = `沟通话术方案已生成：\n\n`;
    r += `**场景分析**\n`;
    r += `- 沟通对象：${target}\n`;
    r += `- 沟通场景：${scenario}\n`;
    r += `- 核心诉求：${demand}\n\n`;

    r += `**沟通策略**\n`;
    if (scenario === '协商解除') {
      r += `策略定位：**柔性引导，以理服人**\n\n`;
      r += `**开场话术**：\n`;
      r += `> "感谢你这段时间的付出。公司基于业务调整，希望跟你坦诚沟通一个方案。我们会严格按照法律规定，保障你的所有权益。"\n\n`;
      r += `**关键话术**（提出方案）：\n`;
      r += `> "公司愿意按照N+1的标准支付经济补偿，同时协助你办理离职手续和社保转移。你看这个方案是否可以接受？"\n\n`;
    } else if (scenario === '绩效约谈') {
      r += `策略定位：**事实驱动，留有记录**\n\n`;
      r += `**开场话术**：\n`;
      r += `> "今天约你聊一下近期的工作情况。我这里有一些数据想跟你一起看一下。"\n\n`;
      r += `**关键话术**：\n`;
      r += `> "我们希望在接下来30天内看到这些方面的改进。公司会提供必要的支持和资源。我们一起制定一个改进计划，好吗？"\n\n`;
    } else if (scenario === '纪律处分') {
      r += `策略定位：**程序合规，证据先行**\n\n`;
      r += `**开场话术**：\n`;
      r += `> "今天请你来，是关于XX事项需要跟你正式沟通。根据公司《员工手册》第X条的规定，我们需要了解具体情况。"\n\n`;
    } else {
      r += `策略定位：**诚意挽留，条件开放**\n\n`;
      r += `**开场话术**：\n`;
      r += `> "你在团队中的贡献大家有目共睹。听说你有一些想法，我想了解你的真实诉求，看公司能否做一些调整。"\n\n`;
    }

    r += `**⚠️ 禁忌清单**\n`;
    r += `- 不要说"你不胜任""你能力不行"（构成人格侮辱，可能被录音取证）\n`;
    r += `- 不要口头承诺具体金额（以书面协议为准）\n`;
    r += `- 不要威胁"不签就走仲裁"（构成胁迫，协议可撤销）\n`;
    r += `- 全程保持尊重，建议两人以上在场\n\n`;
    r += `**留痕建议**\n`;
    r += `1. 沟通前准备书面谈话记录模板\n`;
    r += `2. 沟通后请员工签字确认或发送会议纪要邮件\n`;
    r += `3. 保留考勤、绩效评估等客观证据`;

    return {
      content: r,
      analysisSteps: [
        { step: 1, title: '对象画像', content: `沟通对象为"${target}"，评估其可能的敏感度和诉求。`, status: 'completed' },
        { step: 2, title: '场景研判', content: `场景为"${scenario}"，确定法律风险点和沟通边界。`, status: 'completed' },
        { step: 3, title: '策略匹配', content: `核心诉求为"${demand}"，制定对应话术策略。`, status: 'completed' },
        { step: 4, title: '话术生成', content: '生成开场白、关键节点话术和应对预案。', status: 'completed' },
        { step: 5, title: '风险警示', content: '标注沟通禁忌、留痕要求和程序合规要点。', status: 'active', refIds: [1] },
      ],
      inlineCitations: [
        { id: 1, refId: 1, source: '北大法宝', type: 'authoritative', title: '《中华人民共和国劳动合同法》第三十六条', shortTitle: '劳动合同法 第36条', content: '用人单位与劳动者协商一致，可以解除劳动合同。', highlightRange: '协商一致，可以解除劳动合同', tag: '北大法宝', effectiveDate: '2008年1月1日起施行' },
        { id: 2, refId: 2, source: '北大法宝', type: 'authoritative', title: '《中华人民共和国劳动合同法》第四十条', shortTitle: '劳动合同法 第40条', content: '有下列情形之一的，用人单位提前三十日以书面形式通知劳动者本人或者额外支付劳动者一个月工资后，可以解除劳动合同：（一）劳动者患病或者非因工负伤……（二）劳动者不能胜任工作，经过培训或者调整工作岗位，仍不能胜任工作的……', highlightRange: '劳动者不能胜任工作，经过培训或者调整工作岗位，仍不能胜任工作的', tag: '北大法宝', effectiveDate: '2008年1月1日起施行' },
      ],
    };
  },
};

/* ═══════════════════════════════════════════════
   法规库检索（律师）
   ═══════════════════════════════════════════════ */
const lawSearch = {
  key: 'law_search',
  title: '法规库检索',
  subtitle: '法律检索助手 · 精准定位',
  persona: '法律检索助手',
  requiredFields: [
    {
      key: 'legalIssue',
      label: '核心争议点',
      prompt: '请提供您需要检索的**核心法律争议点**（如：加班费计算基数、违法解除认定标准等）：',
    },
    {
      key: 'jurisdiction',
      label: '适用地区',
      prompt: '请提供核心争议点及适用的**具体城市**，以便我为您检索当地的司法审判口径：',
      chips: ['北京', '上海', '广州', '深圳', '杭州', '成都'],
    },
    {
      key: 'timeScope',
      label: '时效要求',
      prompt: '请选择您需要的**检索时效范围**：',
      chips: ['最新司法解释（2024-至今）', '近三年判例', '历史法规沿革'],
    },
  ],
  greeting:
    '您好，我是您的**法律检索助手**。我将帮您精准定位相关法规、司法解释及地方性审判口径。\n\n请提供核心争议点及适用的具体城市，以便我为您检索当地的司法审判口径。\n\n我需要确认：\n1. 核心法律争议点\n2. 适用地区\n3. 检索时效范围\n\n首先——请描述您的**核心争议点**：',
  parseInput(text, fields) {
    const updates = {};
    if (fields.legalIssue.status !== 'complete' && text.length >= 4) {
      updates.legalIssue = text;
    }
    const cities = ['北京', '上海', '广州', '深圳', '杭州', '成都', '武汉', '南京', '苏州', '重庆', '天津', '西安', '郑州', '长沙', '济南'];
    if (fields.jurisdiction.status !== 'complete') {
      for (const city of cities) {
        if (text.includes(city)) { updates.jurisdiction = city; break; }
      }
    }
    const timeMap = {
      '最新司法解释（2024-至今）': ['最新', '2024', '2025', '2026', '最近'],
      '近三年判例': ['近三年', '三年', '近年'],
      '历史法规沿革': ['历史', '沿革', '变迁', '修订'],
    };
    if (fields.timeScope.status !== 'complete') {
      for (const [label, kws] of Object.entries(timeMap)) {
        if (kws.some((kw) => text.includes(kw))) { updates.timeScope = label; break; }
      }
    }
    return updates;
  },
  generateReport(fields) {
    const issue = fields.legalIssue.value;
    const city = fields.jurisdiction.value;
    const scope = fields.timeScope.value;

    let r = `法规检索结果已生成：\n\n`;
    r += `**检索参数**\n`;
    r += `- 争议焦点：${issue}\n`;
    r += `- 适用地区：${city}\n`;
    r += `- 时效范围：${scope}\n\n`;

    r += `**检索结果**\n\n`;
    r += `**一、全国性法律法规**\n`;
    r += `- 《中华人民共和国劳动合同法》（2012修正）[1]\n`;
    r += `- 《劳动争议调解仲裁法》[2]\n`;
    r += `- 最高人民法院关于审理劳动争议案件适用法律问题的解释（一）\n\n`;
    r += `**二、${city}地方性规定**\n`;
    r += `- ${city}市高级人民法院关于劳动争议案件审理指南\n`;
    r += `- ${city}市人力资源和社会保障局关于劳动关系若干问题的意见\n\n`;

    r += `**地域差异提醒**\n`;
    r += `⚠️ "${issue}"在${city}的裁判口径可能与其他地区存在差异。建议重点关注${city}高院/中院的会议纪要及典型案例。\n\n`;
    r += `**使用建议**\n`;
    r += `1. 优先适用全国性法律法规，地方规定作为补充\n`;
    r += `2. 关注司法解释的时效性，以最新修正版本为准\n`;
    r += `3. 结合当地仲裁委的裁判惯例综合判断`;

    return {
      content: r,
      analysisSteps: [
        { step: 1, title: '争议定性', content: `核心争议为"${issue}"，确定检索关键词。`, status: 'completed' },
        { step: 2, title: '法规检索', content: '检索全国性法律法规、司法解释。', status: 'completed', refIds: [1, 2] },
        { step: 3, title: '地方规定检索', content: `检索${city}地方性劳动法规及裁判指引。`, status: 'completed' },
        { step: 4, title: '时效性筛选', content: `按"${scope}"范围筛选，排除已废止法规。`, status: 'completed' },
        { step: 5, title: '差异比对', content: `比对${city}与全国口径差异，标注重点关注事项。`, status: 'active' },
      ],
      inlineCitations: [
        { id: 1, refId: 1, source: '北大法宝', type: 'authoritative', title: '《中华人民共和国劳动合同法》（2012修正）', shortTitle: '劳动合同法（2012修正）', content: '2007年6月29日第十届全国人民代表大会常务委员会第二十八次会议通过，2012年12月28日第十一届全国人民代表大会常务委员会第三十次会议修正。', highlightRange: '2012年12月28日', tag: '北大法宝', effectiveDate: '2013年7月1日起施行' },
        { id: 2, refId: 2, source: '北大法宝', type: 'authoritative', title: '《中华人民共和国劳动争议调解仲裁法》', shortTitle: '劳动仲裁法', content: '劳动争议申请仲裁的时效期间为一年。仲裁时效期间从当事人知道或者应当知道其权利被侵害之日起计算。', highlightRange: '劳动争议申请仲裁的时效期间为一年', tag: '北大法宝', effectiveDate: '2008年5月1日起施行' },
      ],
    };
  },
};

/* ═══════════════════════════════════════════════
   证据整理工具（律师）
   ═══════════════════════════════════════════════ */
const evidenceOrganizer = {
  key: 'evidence_organizer',
  title: '证据整理工具',
  subtitle: '证据合规员 · 分类归档',
  persona: '证据合规员',
  requiredFields: [
    {
      key: 'caseType',
      label: '案件类型',
      prompt: '请选择或描述**案件类型**：',
      chips: ['劳动仲裁', '工伤认定', '社保争议', '竞业限制纠纷'],
    },
    {
      key: 'evidenceList',
      label: '现有证据清单',
      prompt: '请列出目前已掌握的**证据材料**（可多选或描述）：',
      chips: ['录音', '邮件', '打卡记录', '工资条', '劳动合同', '微信聊天记录'],
    },
    {
      key: 'factsToProve',
      label: '待证事实',
      prompt: '请描述需要这些证据**证明的法律事实**（如：存在劳动关系、加班事实、工资标准等）：',
      chips: ['证明劳动关系成立', '证明加班事实', '证明工资标准', '证明违法解除'],
    },
  ],
  greeting:
    '您好，我是您的**证据合规员**。我将协助您按证明力等级对证据进行分类归档。\n\n请告诉我：\n1. 案件类型\n2. 现有证据清单\n3. 待证明的法律事实\n\n首先——请选择**案件类型**：',
  parseInput(text, fields) {
    const updates = {};
    const caseMap = {
      '劳动仲裁': ['仲裁', '劳动争议'],
      '工伤认定': ['工伤', '受伤'],
      '社保争议': ['社保', '公积金'],
      '竞业限制纠纷': ['竞业', '竞业限制'],
    };
    if (fields.caseType.status !== 'complete') {
      for (const [label, kws] of Object.entries(caseMap)) {
        if (kws.some((kw) => text.includes(kw))) { updates.caseType = label; break; }
      }
    }
    const evidKws = ['录音', '邮件', '打卡', '工资条', '合同', '微信', '聊天', '短信', '照片', '截图', '银行流水', '社保记录'];
    if (fields.evidenceList.status !== 'complete') {
      const found = evidKws.filter((kw) => text.includes(kw));
      if (found.length > 0) updates.evidenceList = text;
    }
    const factMap = {
      '证明劳动关系成立': ['劳动关系', '证明在职', '存在劳动'],
      '证明加班事实': ['加班', '超时工作'],
      '证明工资标准': ['工资标准', '工资数额', '薪资'],
      '证明违法解除': ['违法解除', '非法辞退', '违法辞退'],
    };
    if (fields.factsToProve.status !== 'complete') {
      for (const [label, kws] of Object.entries(factMap)) {
        if (kws.some((kw) => text.includes(kw))) { updates.factsToProve = label; break; }
      }
      if (!updates.factsToProve && text.length >= 4) updates.factsToProve = text;
    }
    return updates;
  },
  generateReport(fields) {
    const caseType = fields.caseType.value;
    const evidence = fields.evidenceList.value;
    const fact = fields.factsToProve.value;

    const hasContract = evidence.includes('合同');
    const hasRecording = evidence.includes('录音');
    const hasPaySlip = evidence.includes('工资') || evidence.includes('银行');
    const hasChat = evidence.includes('微信') || evidence.includes('聊天') || evidence.includes('短信');
    const hasAttendance = evidence.includes('打卡') || evidence.includes('考勤');

    let r = `证据整理报告已生成：\n\n`;
    r += `**案件概要**\n`;
    r += `- 案件类型：${caseType}\n`;
    r += `- 待证事实：${fact}\n\n`;

    r += `**证据分级归档**\n\n`;
    r += `**A级（直接证据·证明力最强）**\n`;
    if (hasContract) r += `- ✅ 劳动合同 — 直接证明劳动关系及约定条件\n`;
    if (hasPaySlip) r += `- ✅ 工资记录 — 直接证明薪酬标准\n`;
    if (!hasContract && !hasPaySlip) r += `- ❌ 暂无A级直接证据\n`;

    r += `\n**B级（间接证据·需相互印证）**\n`;
    if (hasRecording) r += `- ✅ 录音 — 注意：单方录音合法，但需原始载体保全[1]\n`;
    if (hasChat) r += `- ✅ 聊天记录 — 需完整截图（含对方头像、时间戳）\n`;
    if (hasAttendance) r += `- ✅ 打卡记录 — 可证明出勤及加班事实\n`;
    if (!hasRecording && !hasChat && !hasAttendance) r += `- ❌ 暂无B级间接证据\n`;

    r += `\n**证据链完整性评估**\n`;
    const totalEvidence = [hasContract, hasPaySlip, hasRecording, hasChat, hasAttendance].filter(Boolean).length;
    if (totalEvidence >= 3) {
      r += `✅ 证据链相对完整（${totalEvidence}类证据），可形成有效证据组合。\n`;
    } else {
      r += `⚠️ 证据链不完整（仅${totalEvidence}类），建议补充取证。\n`;
    }

    r += `\n**举证责任提醒**\n`;
    r += `根据《劳动争议调解仲裁法》第六条[2]，与争议事项有关的证据**属于用人单位掌握管理的**，用人单位应当提供。`;

    return {
      content: r,
      analysisSteps: [
        { step: 1, title: '案件定性', content: `案件类型为"${caseType}"，确定证据审查标准。`, status: 'completed' },
        { step: 2, title: '证据盘点', content: `已有${totalEvidence}类证据材料，需分级归档。`, status: 'completed' },
        { step: 3, title: '证明力分级', content: '按A级（直接证据）和B级（间接证据）进行分类。', status: 'completed', refIds: [1] },
        { step: 4, title: '证据链评估', content: '评估证据链完整性，识别关键缺口。', status: 'completed' },
        { step: 5, title: '举证策略', content: '结合举证责任分配规则，给出补证建议。', status: 'active', refIds: [2] },
      ],
      inlineCitations: [
        { id: 1, refId: 1, source: '北大法宝', type: 'authoritative', title: '《最高人民法院关于民事诉讼证据的若干规定》第十四条', shortTitle: '民诉证据规定 第14条', content: '电子数据包括但不限于下列信息、电子文件：网页、博客、微博客等网络平台发布的信息；手机短信、电子邮件、即时通信、通讯群组等网络应用服务的通信信息；用户注册信息、身份认证信息、电子交易记录、通信记录、登录日志等信息……', highlightRange: '手机短信、电子邮件、即时通信、通讯群组等网络应用服务的通信信息', tag: '北大法宝', effectiveDate: '2020年5月1日起施行' },
        { id: 2, refId: 2, source: '北大法宝', type: 'authoritative', title: '《劳动争议调解仲裁法》第六条', shortTitle: '劳动仲裁法 第6条', content: '发生劳动争议，当事人对自己提出的主张，有责任提供证据。与争议事项有关的证据属于用人单位掌握管理的，用人单位应当提供；用人单位不提供的，应当承担不利后果。', highlightRange: '与争议事项有关的证据属于用人单位掌握管理的，用人单位应当提供', tag: '北大法宝', effectiveDate: '2008年5月1日起施行' },
      ],
    };
  },
};

/* ═══════════════════════════════════════════════
   赔偿金计算器·律师版
   ═══════════════════════════════════════════════ */
const lawyerCompensation = {
  key: 'lawyer_compensation',
  title: '赔偿金计算器',
  subtitle: '劳动法精算师 · 精密计算',
  persona: '劳动法精算师',
  requiredFields: [
    {
      key: 'seniority',
      label: '详细工龄',
      prompt: '请提供当事人的**详细工龄**信息（含视同工龄，如有连续工龄合并情形请一并说明）：',
      chips: ['不足6个月', '6个月-1年', '1-5年', '5-10年', '10年以上'],
    },
    {
      key: 'salaryBase',
      label: '计算基数',
      prompt: '请提供**月平均工资**（离职前12个月，含奖金、津贴、补贴等货币性收入）：',
    },
    {
      key: 'localCap',
      label: '当地社平工资',
      prompt: '请选择**工作所在城市**，系统将匹配当地社会平均工资上下限（用于封顶/托底计算）：',
      chips: ['北京', '上海', '广州', '深圳', '杭州', '成都'],
    },
    {
      key: 'compensationReason',
      label: '补偿/赔偿事由',
      prompt: '请选择**具体的补偿或赔偿事由**（直接影响倍数及计算公式）：',
      chips: ['违法解除（2N）', '协商解除（N）', '经济性裁员（N）', '合同到期不续签（N）', '工伤伤残补助'],
    },
  ],
  greeting:
    '您好，我是您的**劳动法精算师**。我将确保赔偿金计算严丝合缝，不遗漏任何法定加成。\n\n请依次提供：\n1. 当事人详细工龄（含视同工龄）\n2. 月平均工资（计算基数）\n3. 工作所在城市（社平工资上下限）\n4. 具体的补偿/赔偿事由\n\n首先——请提供当事人的**详细工龄**：',
  parseInput(text, fields) {
    const updates = {};
    // Seniority
    const seniorityMap = {
      '不足6个月': ['不足6', '不到半年', '3个月', '4个月', '5个月'],
      '6个月-1年': ['半年', '6个月', '7个月', '8个月', '9个月', '10个月', '11个月'],
      '1-5年': ['1年', '2年', '3年', '4年', '5年', '两年', '三年', '四年'],
      '5-10年': ['6年', '7年', '8年', '9年', '10年', '六年', '七年', '八年', '九年', '十年'],
      '10年以上': ['11年', '12年', '15年', '20年', '十几年', '二十年', '十年以上'],
    };
    if (fields.seniority.status !== 'complete') {
      for (const [label, kws] of Object.entries(seniorityMap)) {
        if (kws.some((kw) => text.includes(kw))) { updates.seniority = label; break; }
      }
      // Accept free text with numbers
      if (!updates.seniority && text.match(/\d+\s*(年|个月)/)) {
        updates.seniority = text;
      }
    }
    // Salary
    const salaryMatch =
      text.match(/(\d[\d,]*)\s*[元块]/) ||
      text.match(/(?:月薪|工资|薪资|收入|基数)[：:\s]*(\d[\d,]*)/) ||
      (fields.salaryBase.status !== 'complete' && text.match(/^(\d{4,})$/m));
    if (salaryMatch && fields.salaryBase.status !== 'complete') {
      updates.salaryBase = salaryMatch[1].replace(/,/g, '') + '元';
    }
    // City
    const cities = ['北京', '上海', '广州', '深圳', '杭州', '成都', '武汉', '南京', '苏州', '重庆'];
    if (fields.localCap.status !== 'complete') {
      for (const city of cities) {
        if (text.includes(city)) { updates.localCap = city; break; }
      }
    }
    // Reason
    const reasonMap = {
      '违法解除（2N）': ['违法', '开除', '辞退', '无正当'],
      '协商解除（N）': ['协商'],
      '经济性裁员（N）': ['裁员', '裁减'],
      '合同到期不续签（N）': ['到期', '不续签'],
      '工伤伤残补助': ['工伤', '伤残'],
    };
    if (fields.compensationReason.status !== 'complete') {
      for (const [label, kws] of Object.entries(reasonMap)) {
        if (kws.some((kw) => text.includes(kw))) { updates.compensationReason = label; break; }
      }
    }
    return updates;
  },
  generateReport(fields) {
    const seniority = fields.seniority.value;
    const salaryStr = fields.salaryBase.value;
    const city = fields.localCap.value;
    const reason = fields.compensationReason.value;
    const salaryNum = parseInt(salaryStr.replace(/[^\d]/g, ''), 10) || 0;

    // Parse N from seniority
    let n = 1;
    const yearMatch = seniority.match(/(\d+)\s*年/);
    const monthMatch = seniority.match(/(\d+)\s*个月/);
    if (yearMatch) {
      n = parseInt(yearMatch[1], 10);
    } else if (monthMatch) {
      const months = parseInt(monthMatch[1], 10);
      n = months >= 6 ? 1 : 0.5;
    } else if (seniority.includes('不足6')) {
      n = 0.5;
    } else if (seniority.includes('6个月-1年')) {
      n = 1;
    } else if (seniority.includes('1-5')) {
      n = 3;
    } else if (seniority.includes('5-10')) {
      n = 7;
    } else if (seniority.includes('10年以上')) {
      n = 12;
    }

    // Social average salary caps (mock data)
    const socialAvg = { '北京': 13438, '上海': 12307, '广州': 11202, '深圳': 12964, '杭州': 11281, '成都': 9234 };
    const avg = socialAvg[city] || 10000;
    const cap = avg * 3;
    const cappedSalary = Math.min(salaryNum, cap);
    const isCapped = salaryNum > cap;

    let multiplier = 1;
    let label = '经济补偿（N）';
    if (reason.includes('违法') || reason.includes('2N')) { multiplier = 2; label = '违法解除赔偿金（2N）'; }
    else if (reason.includes('工伤')) { multiplier = 0; label = '工伤伤残补助（另行计算）'; }

    const baseComp = cappedSalary * n;
    const total = baseComp * multiplier;

    let r = `赔偿金精算报告已生成：\n\n`;
    r += `**计算参数**\n`;
    r += `- 工龄：${seniority}（N=${n}）\n`;
    r += `- 月平均工资：${salaryNum.toLocaleString()} 元\n`;
    r += `- 工作所在地：${city}\n`;
    r += `- 当地社平工资3倍封顶：${cap.toLocaleString()} 元/月\n`;
    r += `- 赔偿事由：${reason}\n\n`;

    if (isCapped) {
      r += `**⚠️ 封顶规则触发**\n`;
      r += `当事人月工资 ${salaryNum.toLocaleString()} 元 > ${city}社平工资3倍 ${cap.toLocaleString()} 元\n`;
      r += `依据第47条第2款[2]：月工资高于社平工资3倍的，按3倍计算，且年限最高不超过12年。\n`;
      r += `实际计算基数：${cappedSalary.toLocaleString()} 元\n\n`;
    }

    if (multiplier > 0) {
      r += `**计算过程**\n`;
      r += `- 经济补偿（N） = ${n} × ${cappedSalary.toLocaleString()} = **${baseComp.toLocaleString()} 元**\n`;
      if (multiplier === 2) {
        r += `- 违法解除赔偿金（2N） = ${baseComp.toLocaleString()} × 2 = **${total.toLocaleString()} 元**\n`;
      }
    } else {
      r += `**工伤赔偿提示**\n`;
      r += `工伤伤残赔偿需根据伤残等级（1-10级）另行计算，包括一次性伤残补助金、伤残津贴、医疗补助金等，建议结合工伤认定结论单独核算。\n`;
    }

    r += `\n**律师审核要点**\n`;
    r += `1. 核实工龄是否有视同工龄合并情形（关联企业、劳务派遣转正等）\n`;
    r += `2. 月平均工资是否包含年终奖的月均分摊\n`;
    r += `3. 注意代通知金（+1）是否适用（依据第40条）`;

    return {
      content: r,
      analysisSteps: [
        { step: 1, title: '工龄核算', content: `工龄为"${seniority}"，N=${n}。需核实是否有视同工龄。`, status: 'completed' },
        { step: 2, title: '基数确定', content: `月工资${salaryNum.toLocaleString()}元，${isCapped ? '触发社平3倍封顶，按' + cappedSalary.toLocaleString() + '元计算' : '未触发封顶规则'}。`, status: 'completed', refIds: [2] },
        { step: 3, title: '事由认定', content: `赔偿事由为"${reason}"，确定适用倍数。`, status: 'completed', refIds: [1] },
        { step: 4, title: '金额计算', content: multiplier > 0 ? `${label} = ${total.toLocaleString()} 元。` : '工伤赔偿需另行核算。', status: 'completed', refIds: [1, 2] },
        { step: 5, title: '审核建议', content: '标注律师审核要点：视同工龄、年终奖分摊、代通知金。', status: 'active' },
      ],
      inlineCitations: [
        { id: 1, refId: 1, source: '北大法宝', type: 'authoritative', title: '《中华人民共和国劳动合同法》第八十七条', shortTitle: '劳动合同法 第87条', content: '用人单位违反本法规定解除或者终止劳动合同的，应当依照本法第四十七条规定的经济补偿标准的二倍向劳动者支付赔偿金。', highlightRange: '经济补偿标准的二倍向劳动者支付赔偿金', tag: '北大法宝', effectiveDate: '2008年1月1日起施行' },
        { id: 2, refId: 2, source: '北大法宝', type: 'authoritative', title: '《中华人民共和国劳动合同法》第四十七条', shortTitle: '劳动合同法 第47条', content: '经济补偿按劳动者在本单位工作的年限，每满一年支付一个月工资的标准向劳动者支付。六个月以上不满一年的，按一年计算；不满六个月的，向劳动者支付半个月工资的经济补偿。劳动者月工资高于用人单位所在直辖市、设区的市级人民政府公布的本地区上年度职工月平均工资三倍的，向其支付经济补偿的标准按职工月平均工资三倍的数额支付，向其支付经济补偿的年限最高不超过十二年。', highlightRange: '劳动者月工资高于用人单位所在直辖市、设区的市级人民政府公布的本地区上年度职工月平均工资三倍的', tag: '北大法宝', effectiveDate: '2008年1月1日起施行' },
      ],
    };
  },
};

/* ── 导出 ── */
export const MODULE_CONFIGS = {
  compensation_calculator: compensationCalculator,
  evidence_checker: evidenceChecker,
  strategy_advisor: strategyAdvisor,
  compliance_scanner: complianceScanner,
  contract_templates: contractTemplates,
  communication_guide: communicationGuide,
  law_search: lawSearch,
  evidence_organizer: evidenceOrganizer,
  lawyer_compensation: lawyerCompensation,
};
