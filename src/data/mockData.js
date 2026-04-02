export const ROLES = {
  worker: {
    key: 'worker',
    label: '劳动者',
    bgClass: 'bg-brand',
    textClass: 'text-brand',
    borderClass: 'border-brand',
  },
  employer: {
    key: 'employer',
    label: '用工者',
    bgClass: 'bg-brand-muted',
    textClass: 'text-brand-muted',
    borderClass: 'border-brand-muted',
  },
  lawyer: {
    key: 'lawyer',
    label: '律师',
    bgClass: 'bg-brand-dark',
    textClass: 'text-brand-dark',
    borderClass: 'border-brand-dark',
  },
};

export const GUIDE_CHIPS = {
  worker: ['入职时间', '所在城市', '用工形式', '合同类型', '离职原因'],
  employer: ['企业规模', '用工地点', '行业类别', '员工类型', '风险场景'],
  lawyer: ['案件类型', '管辖法院', '争议金额', '证据清单', '适用地区'],
};

export const ROLE_GREETINGS = {
  worker: {
    content:
      '您好，我是您的 AI 劳动法律顾问。我将帮助您进行维权咨询、合同审核及权益保障分析。\n\n为了给您准确的建议，请先告诉我：\n1. 您的用工形式（正式合同/劳务派遣/外包）\n2. 遇到了什么问题',
    followUpOptions: ['我被违法辞退了', '公司拖欠工资', '想了解赔偿标准'],
  },
  employer: {
    content:
      '您好，我是您的 AI 企业合规顾问。我将帮助您进行企业合规审查、合同模板生成及员工沟通策略制定。\n\n请告诉我您目前关注的问题：',
    followUpOptions: ['需要解除员工合同', '审查规章制度合规性', '生成劳动合同模板'],
  },
  lawyer: {
    content:
      '您好，我是您的法律助手。我将协助您进行专业法规检索、案例分析及证据链整理。\n\n请问需要检索哪些法条或案例？',
    followUpOptions: ['检索最新司法解释', '整理案件证据链', '计算赔偿金（含封顶）'],
  },
};

export const HISTORY_ITEMS = [
  { id: 1, title: '未签劳动合同双倍工资', date: '2026-03-28', status: '已完成' },
  { id: 2, title: '违法解除赔偿金计算', date: '2026-03-25', status: '已完成' },
  { id: 3, title: '工伤认定流程咨询', date: '2026-03-20', status: '进行中' },
  { id: 4, title: '竞业限制协议效力', date: '2026-03-15', status: '已完成' },
];

export const MOCK_CONVERSATION = [
  {
    id: 1,
    role: 'user',
    content: '我被开了怎么办？在公司干了3年，老板说效益不好直接让我走。',
    timestamp: '14:30',
  },
  {
    id: 2,
    role: 'assistant',
    content:
      '我理解您的情况。为了帮您准确分析，我需要进一步了解：您的离职属于以下哪种情况？',
    timestamp: '14:30',
    followUpOptions: ['违法解除（无正当理由）', '协商解除（双方协商）', '经济性裁员'],
  },
  {
    id: 3,
    role: 'user',
    content: '老板就口头通知的，没有任何书面文件，也没说什么理由。应该是违法解除。',
    timestamp: '14:31',
  },
  {
    id: 4,
    role: 'assistant',
    content:
      '根据您的描述，用人单位未提供合法解除理由且无书面通知，这极大概率构成 **违法解除劳动合同**。\n\n根据《劳动合同法》第八十七条[1]，用人单位违法解除劳动合同的，应当依照第四十七条[2]规定的经济补偿标准的 **二倍** 向劳动者支付赔偿金。\n\n您工作满3年，赔偿金计算方式如下：\n- 经济补偿 = 3年 × 月平均工资\n- 违法解除赔偿金 = 经济补偿 × 2 = **6个月工资**\n\n此外，根据《劳动合同法》第五十条[3]，用人单位应当在解除劳动合同时出具解除证明，并在十五日内办理档案和社保转移手续。\n\n建议您：\n1. 保留所有沟通记录（微信、短信等）作为证据\n2. 要求用人单位出具书面解除通知\n3. 如协商不成，可向劳动仲裁委申请仲裁',
    timestamp: '14:32',
    citations: [1, 2, 3],
    analysisSteps: [
      {
        step: 1,
        title: '事实认定',
        content: '用户在该单位工作满3年；用人单位口头通知解除，无书面文件，未说明解除理由。',
        status: 'completed',
      },
      {
        step: 2,
        title: '法律关系分析',
        content: '双方存在事实劳动关系。用人单位单方解除需符合《劳动合同法》第三十九、四十、四十一条规定的法定情形。',
        status: 'completed',
        refIds: [4, 5, 6],
      },
      {
        step: 3,
        title: '违法性判定',
        content: '用人单位未提供合法解除事由，且未履行书面通知义务，不符合法定解除条件，构成违法解除。',
        status: 'completed',
        refIds: [1],
      },
      {
        step: 4,
        title: '赔偿计算',
        content: '适用第87条，违法解除赔偿金 = 经济补偿（N）× 2 = 3 × 2 = 6个月工资。',
        status: 'completed',
        refIds: [1, 2],
      },
      {
        step: 5,
        title: '救济途径',
        content: '建议先行协商，协商不成可申请劳动仲裁（时效1年），对裁决不服可向法院起诉。',
        status: 'active',
        refIds: [3],
      },
    ],
    inlineCitations: [
      {
        id: 1,
        refId: 1,
        source: '北大法宝',
        type: 'authoritative',
        title: '《中华人民共和国劳动合同法》第八十七条',
        shortTitle: '劳动合同法 第87条',
        content: '用人单位违反本法规定解除或者终止劳动合同的，应当依照本法第四十七条规定的经济补偿标准的二倍向劳动者支付赔偿金。',
        highlightRange: '应当依照本法第四十七条规定的经济补偿标准的二倍向劳动者支付赔偿金',
        tag: '北大法宝',
        effectiveDate: '2008年1月1日起施行',
      },
      {
        id: 2,
        refId: 2,
        source: '北大法宝',
        type: 'authoritative',
        title: '《中华人民共和国劳动合同法》第四十七条',
        shortTitle: '劳动合同法 第47条',
        content: '经济补偿按劳动者在本单位工作的年限，每满一年支付一个月工资的标准向劳动者支付。六个月以上不满一年的，按一年计算；不满六个月的，向劳动者支付半个月工资的经济补偿。\n\n劳动者月工资高于用人单位所在直辖市、设区的市级人民政府公布的本地区上年度职工月平均工资三倍的，向其支付经济补偿的标准按职工月平均工资三倍的数额支付，向其支付经济补偿的年限最高不超过十二年。\n\n本条所称月工资是指劳动者在劳动合同解除或者终止前十二个月的平均工资。',
        highlightRange: '每满一年支付一个月工资的标准向劳动者支付',
        tag: '北大法宝',
        effectiveDate: '2008年1月1日起施行',
      },
      {
        id: 3,
        refId: 3,
        source: '北大法宝',
        type: 'authoritative',
        title: '《中华人民共和国劳动合同法》第五十条',
        shortTitle: '劳动合同法 第50条',
        content: '用人单位应当在解除或者终止劳动合同时出具解除或者终止劳动合同的证明，并在十五日内为劳动者办理档案和社会保险关系转移手续。\n\n劳动者应当按照双方约定，办理工作交接。用人单位依照本法有关规定应当向劳动者支付经济补偿的，在办结工作交接时支付。\n\n用人单位对已经解除或者终止的劳动合同的文本，至少保存二年备查。',
        highlightRange: '应当在解除或者终止劳动合同时出具解除或者终止劳动合同的证明，并在十五日内为劳动者办理档案和社会保险关系转移手续',
        tag: '北大法宝',
        effectiveDate: '2008年1月1日起施行',
      },
      {
        id: 4,
        refId: 4,
        source: '北大法宝',
        type: 'authoritative',
        title: '《中华人民共和国劳动合同法》第三十九条',
        shortTitle: '劳动合同法 第39条',
        content: '劳动者有下列情形之一的，用人单位可以解除劳动合同：\n（一）在试用期间被证明不符合录用条件的；\n（二）严重违反用人单位的规章制度的；\n（三）严重失职，营私舞弊，给用人单位造成重大损害的；\n（四）劳动者同时与其他用人单位建立劳动关系，对完成本单位的工作任务造成严重影响，或者经用人单位提出，拒不改正的；\n（五）因本法第二十六条第一款第一项规定的情形致使劳动合同无效的；\n（六）被依法追究刑事责任的。',
        highlightRange: '劳动者有下列情形之一的，用人单位可以解除劳动合同',
        tag: '北大法宝',
        effectiveDate: '2008年1月1日起施行',
      },
      {
        id: 5,
        refId: 5,
        source: '北大法宝',
        type: 'authoritative',
        title: '《中华人民共和国劳动合同法》第四十条',
        shortTitle: '劳动合同法 第40条',
        content: '有下列情形之一的，用人单位提前三十日以书面形式通知劳动者本人或者额外支付劳动者一个月工资后，可以解除劳动合同：\n（一）劳动者患病或者非因工负伤，在规定的医疗期满后不能从事原工作，也不能从事由用人单位另行安排的工作的；\n（二）劳动者不能胜任工作，经过培训或者调整工作岗位，仍不能胜任工作的；\n（三）劳动合同订立时所依据的客观情况发生重大变化，致使劳动合同无法履行，经用人单位与劳动者协商，未能就变更劳动合同内容达成协议的。',
        highlightRange: '用人单位提前三十日以书面形式通知劳动者本人或者额外支付劳动者一个月工资后，可以解除劳动合同',
        tag: '北大法宝',
        effectiveDate: '2008年1月1日起施行',
      },
      {
        id: 6,
        refId: 6,
        source: '北大法宝',
        type: 'authoritative',
        title: '《中华人民共和国劳动合同法》第四十一条',
        shortTitle: '劳动合同法 第41条',
        content: '有下列情形之一，需要裁减人员二十人以上或者裁减不足二十人但占企业职工总数百分之十以上的，用人单位提前三十日向工会或者全体职工说明情况，听取工会或者职工的意见后，裁减人员方案经向劳动行政部门报告，可以裁减人员：\n（一）依照企业破产法规定进行重整的；\n（二）生产经营发生严重困难的；\n（三）企业转产、重大技术革新或者经营方式调整，经变更劳动合同后，仍需裁减人员的；\n（四）其他因劳动合同订立时所依据的客观经济情况发生重大变化，致使劳动合同无法履行的。',
        highlightRange: '用人单位提前三十日向工会或者全体职工说明情况，听取工会或者职工的意见后，裁减人员方案经向劳动行政部门报告，可以裁减人员',
        tag: '北大法宝',
        effectiveDate: '2008年1月1日起施行',
      },
      {
        id: 7,
        refId: null,
        source: '君合律师事务所',
        type: 'secondary',
        title: '违法解除劳动合同的实务要点与风险防范',
        shortTitle: '君合 · 实务文章',
        content: '在司法实践中，用人单位以"经营困难"为由解除劳动合同，若未履行法定程序（提前三十日书面通知工会、向劳动行政部门报告等），通常会被认定为违法解除。',
        tag: '红圈所文章',
        author: '张某某律师',
        publishDate: '2025年12月',
      },
    ],
  },
];

export const MOCK_ANALYSIS_STEPS = [
  {
    step: 1,
    title: '事实认定',
    content: '用户在该单位工作满3年；用人单位口头通知解除，无书面文件，未说明解除理由。',
    status: 'completed',
  },
  {
    step: 2,
    title: '法律关系分析',
    content:
      '双方存在事实劳动关系。用人单位单方解除需符合《劳动合同法》第三十九、四十、四十一条规定的法定情形。',
    status: 'completed',
  },
  {
    step: 3,
    title: '违法性判定',
    content:
      '用人单位未提供合法解除事由，且未履行书面通知义务，不符合法定解除条件，构成违法解除。',
    status: 'completed',
  },
  {
    step: 4,
    title: '赔偿计算',
    content:
      '适用《劳动合同法》第87条，违法解除赔偿金 = 经济补偿（N）× 2 = 3 × 2 = 6个月工资。',
    status: 'completed',
  },
  {
    step: 5,
    title: '救济途径',
    content: '建议先行协商，协商不成可申请劳动仲裁（时效1年），对裁决不服可向法院起诉。',
    status: 'active',
  },
];

export const MOCK_LEGAL_CITATIONS = [
  {
    id: 1,
    refId: 1,
    source: '北大法宝',
    type: 'authoritative',
    title: '《中华人民共和国劳动合同法》第八十七条',
    shortTitle: '劳动合同法 第87条',
    content:
      '用人单位违反本法规定解除或者终止劳动合同的，应当依照本法第四十七条规定的经济补偿标准的二倍向劳动者支付赔偿金。',
    highlightRange: '应当依照本法第四十七条规定的经济补偿标准的二倍向劳动者支付赔偿金',
    tag: '北大法宝',
    tagColor: 'pku-law',
    effectiveDate: '2008年1月1日起施行',
    relevance: '直接适用',
  },
  {
    id: 2,
    refId: 2,
    source: '北大法宝',
    type: 'authoritative',
    title: '《中华人民共和国劳动合同法》第四十七条',
    shortTitle: '劳动合同法 第47条',
    content:
      '经济补偿按劳动者在本单位工作的年限，每满一年支付一个月工资的标准向劳动者支付。六个月以上不满一年的，按一年计算；不满六个月的，向劳动者支付半个月工资的经济补偿。\n\n劳动者月工资高于用人单位所在直辖市、设区的市级人民政府公布的本地区上年度职工月平均工资三倍的，向其支付经济补偿的标准按职工月平均工资三倍的数额支付，向其支付经济补偿的年限最高不超过十二年。\n\n本条所称月工资是指劳动者在劳动合同解除或者终止前十二个月的平均工资。',
    highlightRange: '每满一年支付一个月工资的标准向劳动者支付',
    tag: '北大法宝',
    tagColor: 'pku-law',
    effectiveDate: '2008年1月1日起施行',
    relevance: '赔偿金计算基础',
  },
  {
    id: 3,
    refId: 3,
    source: '北大法宝',
    type: 'authoritative',
    title: '《中华人民共和国劳动合同法》第五十条',
    shortTitle: '劳动合同法 第50条',
    content:
      '用人单位应当在解除或者终止劳动合同时出具解除或者终止劳动合同的证明，并在十五日内为劳动者办理档案和社会保险关系转移手续。\n\n劳动者应当按照双方约定，办理工作交接。用人单位依照本法有关规定应当向劳动者支付经济补偿的，在办结工作交接时支付。\n\n用人单位对已经解除或者终止的劳动合同的文本，至少保存二年备查。',
    highlightRange: '应当在解除或者终止劳动合同时出具解除或者终止劳动合同的证明，并在十五日内为劳动者办理档案和社会保险关系转移手续',
    tag: '北大法宝',
    tagColor: 'pku-law',
    effectiveDate: '2008年1月1日起施行',
    relevance: '程序性义务',
  },
  {
    id: 4,
    refId: null,
    source: '君合律师事务所',
    type: 'secondary',
    title: '违法解除劳动合同的实务要点与风险防范',
    shortTitle: '君合 · 实务文章',
    content:
      '在司法实践中，用人单位以"经营困难"为由解除劳动合同，若未履行法定程序（提前三十日书面通知工会、向劳动行政部门报告等），通常会被认定为违法解除。建议用人单位在解除前充分评估法律风险，完善内部审批流程。',
    tag: '红圈所文章',
    tagColor: 'firm-article',
    author: '张某某律师',
    publishDate: '2025年12月',
    relevance: '实务参考',
  },
  {
    id: 5,
    refId: null,
    source: '金杜律师事务所',
    type: 'secondary',
    title: '2025年度劳动争议典型案例分析报告',
    shortTitle: '金杜 · 案例分析',
    content:
      '在（2025）京01民终1234号案中，法院认定用人单位以口头方式通知劳动者解除合同，未出具书面解除通知，且未能证明存在法定解除事由，构成违法解除，判令支付赔偿金。该案对口头解除的举证责任分配具有典型参考意义。',
    tag: '红圈所文章',
    tagColor: 'firm-article',
    author: '李某某律师',
    publishDate: '2026年1月',
    relevance: '类案参考',
  },
];

export const LAWYER_CASE_ANALYSIS = [
  {
    id: 1,
    caseNumber: '（2025）京01民终1234号',
    court: '北京市第一中级人民法院',
    summary: '口头解除劳动合同被判违法解除，支持二倍赔偿金',
    result: '劳动者胜诉',
    relevance: 95,
  },
  {
    id: 2,
    caseNumber: '（2025）沪02民终5678号',
    court: '上海市第二中级人民法院',
    summary: '用人单位以经营困难为由裁员未经法定程序，被判违法解除',
    result: '劳动者胜诉',
    relevance: 88,
  },
  {
    id: 3,
    caseNumber: '（2024）粤03民终9012号',
    court: '深圳市中级人民法院',
    summary: '经济性裁员程序合规，法院支持用人单位解除行为',
    result: '用人单位胜诉',
    relevance: 72,
  },
];
