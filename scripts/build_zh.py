"""Build the standalone Chinese page from the English layout and reviewed copy."""

from pathlib import Path
import re

from lxml import html


ROOT = Path(__file__).resolve().parents[1] / "dist"
document = html.parse(str(ROOT / "index.html"))
page = document.getroot()


def nodes(selector):
    found = []
    for branch in selector.split(","):
        xpath = "."
        direct = False
        for token in branch.strip().replace(">", " > ").split():
            if token == ">":
                direct = True
                continue
            match = re.match(r"[a-zA-Z][\w-]*", token)
            tag = match.group() if match else "*"
            tests = [
                f"contains(concat(' ', normalize-space(@class), ' '), ' {name} ')"
                for name in re.findall(r"\.([\w-]+)", token)
            ]
            tests += [
                f"@{name}='{value}'"
                for name, value in re.findall(r"\[([\w-]+)='([^']+)'\]", token)
            ]
            nth = re.search(r":nth-child\((\d+)\)", token)
            if nth:
                tests.append(f"count(preceding-sibling::*)={int(nth.group(1)) - 1}")
            if ":last-child" in token:
                tests.append("not(following-sibling::*)")
            xpath += ("/" if direct else "//") + tag
            if tests:
                xpath += "[" + " and ".join(tests) + "]"
            direct = False
        found.extend(page.xpath(xpath))
    return found


def translate(selector, value, mode="text"):
    matches = nodes(selector)
    if not matches:
        raise ValueError(f"Translation selector matched nothing: {selector}")
    for node in matches:
        if mode == "firstText":
            node.text = value
        elif mode == "lastText":
            if len(node):
                node[-1].tail = value
            else:
                node.text = value
        elif mode == "html":
            for child in list(node):
                node.remove(child)
            node.text = None
            for fragment in html.fragments_fromstring(value):
                if isinstance(fragment, str):
                    if len(node):
                        node[-1].tail = (node[-1].tail or "") + fragment
                    else:
                        node.text = (node.text or "") + fragment
                else:
                    node.append(fragment)
        else:
            for child in list(node):
                node.remove(child)
            node.text = value


COPY = [
    (".skip-link", "跳转到内容"),
    (".intro-title-text", "你好，我是 Greenhats"),
    (".intro-line:nth-child(1)", "学生"),
    (".intro-line:nth-child(2)", "AI 全栈 / Agent 开发者"),
    (".intro-line:nth-child(3)", "动画爱好者"),
    (".back-button", "返回首页", "lastText"),
    ("[data-view='experience'] .page-heading h2", "经历", "firstText"),
    ("[data-view='experience'] .timeline article:nth-child(1) .eyebrow", "开源贡献"),
    ("[data-view='experience'] .timeline article:nth-child(1) h3", "LoopX 贡献者"),
    ("[data-view='experience'] .timeline article:nth-child(1) p", "为长期运行的 AI Agent 控制平台补充编码回归测试及 Node 26 兼容性测试。"),
    ("[data-view='experience'] .timeline article:nth-child(2) .timeline-date", "个人项目"),
    ("[data-view='experience'] .timeline article:nth-child(2) .eyebrow", "应用开发"),
    ("[data-view='experience'] .timeline article:nth-child(2) p", "开发 AI 营养应用与 RSS 自动化工具，涵盖 Go 后端、AI 服务与测试。"),
    ("[data-view='experience'] .timeline article:nth-child(3) .eyebrow", "教育经历"),
    ("[data-view='experience'] .timeline article:nth-child(3) h3", "软件工程"),
    ("[data-view='experience'] .timeline article:nth-child(3) p", "河北科技大学本科在读，预计 2028 年 6 月毕业。"),
    ("[data-view='skills'] .page-heading h2", "技能", "firstText"),
    ("[data-view='skills'] .tech-stack-title", "技术栈"),
    ("[data-view='skills'] .detail-row:nth-child(1) h3", "AI 与 Agent"),
    ("[data-view='skills'] .detail-row:nth-child(1) p", "实践 Agent 循环、工具调用、RAG 与向量检索；在 <a href='https://github.com/Green-hats/NutriGo' target='_blank' rel='noopener noreferrer'>NutriGo<span class='external-mark' aria-hidden='true'>↗</span></a> 中结合 LiteLLM、BGE-small-zh 与 ChromaDB 构建五个营养工具。", "html"),
    ("[data-view='skills'] .detail-row:nth-child(2) h3", "后端系统"),
    ("[data-view='skills'] .detail-row:nth-child(2) p", "使用 Go 与 Python 开发 REST API、数据持久化、JWT 认证及服务集成。"),
    ("[data-view='skills'] .detail-row:nth-child(3) h3", "自动化与交付"),
    ("[data-view='skills'] .detail-row:nth-child(3) p", "在 <a href='https://github.com/Green-hats/AniGo' target='_blank' rel='noopener noreferrer'>AniGo<span class='external-mark' aria-hidden='true'>↗</span></a> 中实现 RSS 工作流、LLM 辅助解析与规则筛选；使用 Docker Compose、pytest 和 Go test。", "html"),
    ("[data-view='skills'] .detail-row:nth-child(3) .tag-line span:last-child", "测试"),
    ("[data-view='gallery'] .page-heading h2", "项目", "firstText"),
    ("[data-view='gallery'] .project-tile:nth-child(1) .project-type", "AI 应用"),
    ("[data-view='gallery'] .project-tile:nth-child(1) .project-copy p", "结合食物识别、营养分析及具备五个工具的 Agent，并接入 2,277 条知识的 RAG 数据库。"),
    ("[data-view='gallery'] .project-tile:nth-child(1) .project-facts span:nth-child(1)", "5 个 Agent 工具"),
    ("[data-view='gallery'] .project-tile:nth-child(1) .project-facts span:nth-child(2)", "2,277 条 RAG 知识"),
    ("[data-view='gallery'] .project-tile:nth-child(2) .project-type", "自动化"),
    ("[data-view='gallery'] .project-tile:nth-child(2) .project-copy p", "通过 LLM 解析 RSS 发布信息，再用规则选择版本并协调云端任务。"),
    ("[data-view='gallery'] .project-tile:nth-child(2) .project-facts span:nth-child(2)", "LLM 解析"),
    ("[data-view='gallery'] .project-tile:nth-child(2) .project-facts span:nth-child(3)", "规则筛选"),
    ("[data-view='gallery'] .project-copy a", "查看项目 ", "firstText"),
    ("[data-view='achievements'] .page-heading h2", "荣誉", "firstText"),
    ("[data-view='achievements'] .award-list article:nth-child(1) .eyebrow", "编程竞赛"),
    ("[data-view='achievements'] .award-list article:nth-child(1) h3", "蓝桥杯"),
    ("[data-view='achievements'] .award-list article:nth-child(1) p", "全国软件和信息技术专业人才大赛 · 软件赛 Python 组"),
    ("[data-view='achievements'] .award-list article:nth-child(1) strong", "全国总决赛<br>三等奖", "html"),
    ("[data-view='achievements'] .award-list article:nth-child(2) .eyebrow", "数学建模"),
    ("[data-view='achievements'] .award-list article:nth-child(2) p", "美国大学生数学建模竞赛 / 交叉学科建模竞赛"),
    ("[data-view='achievements'] .award-list article:nth-child(2) strong", "S 奖"),
    ("[data-view='travel'] .page-heading h2", "旅行", "firstText"),
    ("[data-view='travel'] .travel-copy .eyebrow", "暂无记录"),
    ("[data-view='travel'] .travel-copy h3", "后续更新。"),
    ("[data-view='internship'] .page-heading h2", "求职", "firstText"),
    ("[data-view='internship'] .internship-focus p", "我正在寻找以下方向的机会"),
    ("[data-view='internship'] .internship-focus h3", "AI Agent <span>/</span><br>AI 全栈开发", "html"),
    ("[data-view='internship'] .internship-focus>a", "联系我 ", "firstText"),
    ("[data-view='contact'] .page-heading h2", "联系", "firstText"),
    ("[data-view='contact'] .contact-primary .eyebrow", "邮箱"),
    ("[data-view='contact'] .contact-secondary .eyebrow", "查看我的作品"),
    (".theme-menu-title", "外观"),
    ("[data-theme-choice='auto']", "跟随系统"),
    ("[data-theme-choice='light']", "浅色"),
    ("[data-theme-choice='dark']", "深色"),
]

for selector, value, *rest in COPY:
    translate(selector, value, rest[0] if rest else "text")

labels = {
    "experience": "经历", "skills": "技能", "gallery": "项目", "achievements": "荣誉",
    "travel": "旅行", "internship": "求职", "contact": "联系",
}
for name, label in labels.items():
    translate(f".orbit-button[data-page='{name}'] span, .reader-node[data-page='{name}'] .reader-button span", label)
    for button in nodes(f".orbit-button[data-page='{name}'], .reader-node[data-page='{name}'] .reader-button"):
        button.set("aria-label", label)

page.set("lang", "zh-CN")
nodes("meta[name='description']")[0].set("content", "Greenhats 的个人作品集：软件工程学生、AI 全栈与 Agent 开发者、动画爱好者。")
nodes("title")[0].text = "Greenhats · 我的作品集"
nodes(".brand")[0].set("aria-label", "Greenhats，返回首页")
nodes(".home-view")[0].set("aria-label", "首页")
nodes(".character")[0].set("alt", "原始奶油色卡通角色，带深色斑块与温和笑容")
nodes(".project-art-nutri img")[0].set("alt", "NutriGo AI 聊天界面")
nodes(".project-art-anigo img")[0].set("alt", "AniGo 订阅管理界面")
for nav in nodes(".orbit-nav, .reader-nav"):
    nav.set("aria-label", "作品集章节")
nodes(".reader-controls")[0].set("aria-label", "章节控制")
nodes("[data-step='-1']")[0].set("aria-label", "上一章节")
nodes("[data-step='1']")[0].set("aria-label", "下一章节")
nodes(".theme-trigger")[0].set("aria-label", "外观：跟随系统")
nodes(".theme-trigger")[0].set("title", "外观")
nodes("[data-language='en']")[0].attrib.pop("aria-current", None)
nodes("[data-language='zh']")[0].set("aria-current", "page")

output = html.tostring(page, encoding="unicode", method="html", doctype="<!doctype html>")
(ROOT / "zh.html").write_text(output + "\n")
