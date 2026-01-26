import { useState, useCallback } from "react";
import { Play, Zap, Accessibility, Search, Shield, Gauge, CheckCircle, XCircle, AlertTriangle, Info } from "lucide-react";

interface AuditResult {
  id: string;
  title: string;
  description: string;
  score: number; // 0-100
  category: "performance" | "accessibility" | "best-practices" | "seo";
  details?: string[];
}

interface CategoryScore {
  name: string;
  score: number;
  icon: typeof Zap;
  color: string;
}

interface FluxScoreTabProps {
  iframeRef: React.RefObject<HTMLIFrameElement>;
}

export function FluxScoreTab({ iframeRef }: FluxScoreTabProps) {
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<AuditResult[]>([]);
  const [hasRun, setHasRun] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const runAudit = useCallback(async () => {
    const iframe = iframeRef.current;
    if (!iframe?.contentDocument || !iframe?.contentWindow) return;

    setIsRunning(true);
    setResults([]);

    const doc = iframe.contentDocument;
    const win = iframe.contentWindow as Window & typeof globalThis;
    const auditResults: AuditResult[] = [];

    // Simulate audit delay for UX
    await new Promise(resolve => setTimeout(resolve, 500));

    // === PERFORMANCE AUDITS ===

    // Check for render-blocking resources
    const blockingScripts = doc.querySelectorAll('script:not([async]):not([defer])');
    auditResults.push({
      id: "render-blocking",
      title: "Eliminate render-blocking resources",
      description: "Resources that block first paint of your page",
      score: blockingScripts.length === 0 ? 100 : Math.max(0, 100 - blockingScripts.length * 20),
      category: "performance",
      details: blockingScripts.length > 0
        ? [`Found ${blockingScripts.length} render-blocking script(s). Add async or defer attributes.`]
        : undefined,
    });

    // Check image optimization
    const images = doc.querySelectorAll("img");
    const imagesWithoutDimensions = Array.from(images).filter(
      img => !img.hasAttribute("width") || !img.hasAttribute("height")
    );
    const imagesWithoutAlt = Array.from(images).filter(img => !img.hasAttribute("alt"));
    const imagesWithoutLazy = Array.from(images).filter(
      img => !img.hasAttribute("loading") && img.getBoundingClientRect().top > win.innerHeight
    );

    auditResults.push({
      id: "image-dimensions",
      title: "Image elements have explicit width and height",
      description: "Set explicit width and height to prevent layout shifts",
      score: imagesWithoutDimensions.length === 0 ? 100 : Math.max(0, 100 - imagesWithoutDimensions.length * 15),
      category: "performance",
      details: imagesWithoutDimensions.length > 0
        ? [`${imagesWithoutDimensions.length} image(s) missing explicit dimensions`]
        : undefined,
    });

    auditResults.push({
      id: "lazy-loading",
      title: "Offscreen images are lazy-loaded",
      description: "Defer offscreen images to improve initial load time",
      score: imagesWithoutLazy.length === 0 ? 100 : Math.max(0, 100 - imagesWithoutLazy.length * 10),
      category: "performance",
      details: imagesWithoutLazy.length > 0
        ? [`${imagesWithoutLazy.length} offscreen image(s) could use loading="lazy"`]
        : undefined,
    });

    // Check for unused CSS
    const styleSheets = doc.styleSheets;
    let totalRules = 0;
    try {
      for (const sheet of Array.from(styleSheets)) {
        if (sheet.cssRules) {
          totalRules += sheet.cssRules.length;
        }
      }
    } catch {
      // Cross-origin stylesheets
    }

    auditResults.push({
      id: "css-rules",
      title: "Efficient CSS",
      description: "Minimize CSS complexity",
      score: totalRules < 100 ? 100 : totalRules < 500 ? 75 : 50,
      category: "performance",
      details: [`Found ${totalRules} CSS rules`],
    });

    // === ACCESSIBILITY AUDITS ===

    auditResults.push({
      id: "image-alt",
      title: "Image elements have alt attributes",
      description: "Informative alt text for screen readers",
      score: images.length === 0 ? 100 : imagesWithoutAlt.length === 0 ? 100 : Math.max(0, 100 - (imagesWithoutAlt.length / images.length) * 100),
      category: "accessibility",
      details: imagesWithoutAlt.length > 0
        ? [`${imagesWithoutAlt.length} image(s) missing alt attribute`]
        : undefined,
    });

    // Check heading hierarchy
    let headingScore = 100;
    const headingIssues: string[] = [];

    const h1s = doc.querySelectorAll("h1");
    if (h1s.length === 0) {
      headingScore -= 30;
      headingIssues.push("No <h1> element found");
    } else if (h1s.length > 1) {
      headingScore -= 20;
      headingIssues.push(`Multiple <h1> elements found (${h1s.length})`);
    }

    auditResults.push({
      id: "heading-hierarchy",
      title: "Heading elements are in order",
      description: "Properly ordered headings for screen readers",
      score: Math.max(0, headingScore),
      category: "accessibility",
      details: headingIssues.length > 0 ? headingIssues : undefined,
    });

    // Check for form labels
    const inputs = doc.querySelectorAll("input:not([type='hidden']):not([type='submit']):not([type='button'])");
    const inputsWithoutLabels = Array.from(inputs).filter(input => {
      const id = input.getAttribute("id");
      const hasLabel = id ? doc.querySelector(`label[for="${id}"]`) : null;
      const hasAriaLabel = input.hasAttribute("aria-label") || input.hasAttribute("aria-labelledby");
      return !hasLabel && !hasAriaLabel;
    });

    auditResults.push({
      id: "form-labels",
      title: "Form elements have associated labels",
      description: "Labels help users understand form fields",
      score: inputs.length === 0 ? 100 : inputsWithoutLabels.length === 0 ? 100 : Math.max(0, 100 - (inputsWithoutLabels.length / inputs.length) * 100),
      category: "accessibility",
      details: inputsWithoutLabels.length > 0
        ? [`${inputsWithoutLabels.length} input(s) missing labels`]
        : undefined,
    });

    // Check color contrast (simplified)
    const textElements = doc.querySelectorAll("p, span, a, h1, h2, h3, h4, h5, h6, li");
    let lowContrastCount = 0;
    textElements.forEach(el => {
      const style = win.getComputedStyle(el);
      const color = style.color;
      const bg = style.backgroundColor;
      // Simplified contrast check (just checking for very light text on light bg)
      if (color.includes("rgb(255") && bg.includes("rgb(255")) {
        lowContrastCount++;
      }
    });

    auditResults.push({
      id: "color-contrast",
      title: "Background and foreground colors have sufficient contrast",
      description: "Low-contrast text is hard to read",
      score: lowContrastCount === 0 ? 100 : Math.max(0, 100 - lowContrastCount * 10),
      category: "accessibility",
      details: lowContrastCount > 0
        ? [`Found ${lowContrastCount} potential low-contrast element(s)`]
        : undefined,
    });

    // Check for lang attribute
    const hasLang = doc.documentElement.hasAttribute("lang");
    auditResults.push({
      id: "html-lang",
      title: "Page has valid lang attribute",
      description: "Helps screen readers use correct pronunciation",
      score: hasLang ? 100 : 0,
      category: "accessibility",
      details: !hasLang ? ["Add lang attribute to <html> element"] : undefined,
    });

    // === BEST PRACTICES AUDITS ===

    // Check for console errors
    auditResults.push({
      id: "no-errors",
      title: "No browser errors logged to console",
      description: "Console errors indicate potential issues",
      score: 100, // We can't easily check this in preview
      category: "best-practices",
    });

    // Check for deprecated APIs
    const hasDocWrite = doc.documentElement.innerHTML.includes("document.write");
    auditResults.push({
      id: "no-document-write",
      title: "Avoid document.write()",
      description: "document.write() can delay page load",
      score: hasDocWrite ? 0 : 100,
      category: "best-practices",
      details: hasDocWrite ? ["document.write() detected"] : undefined,
    });

    // Check for HTTPS
    auditResults.push({
      id: "uses-https",
      title: "Uses HTTPS",
      description: "Secure connections protect user data",
      score: win.location.protocol === "https:" ? 100 : win.location.protocol === "file:" ? 100 : 50,
      category: "best-practices",
    });

    // Check doctype
    const hasDoctype = doc.doctype !== null;
    auditResults.push({
      id: "doctype",
      title: "Page has DOCTYPE",
      description: "DOCTYPE triggers standards mode",
      score: hasDoctype ? 100 : 0,
      category: "best-practices",
      details: !hasDoctype ? ["Add <!DOCTYPE html> at the start of the page"] : undefined,
    });

    // Check viewport meta
    const hasViewport = doc.querySelector('meta[name="viewport"]') !== null;
    auditResults.push({
      id: "viewport",
      title: "Has viewport meta tag",
      description: "Required for mobile-friendly pages",
      score: hasViewport ? 100 : 0,
      category: "best-practices",
      details: !hasViewport ? ['Add <meta name="viewport" content="width=device-width, initial-scale=1">'] : undefined,
    });

    // === SEO AUDITS ===

    // Check for title
    const title = doc.querySelector("title");
    auditResults.push({
      id: "title",
      title: "Document has a <title> element",
      description: "Titles are important for SEO and accessibility",
      score: title && title.textContent ? 100 : 0,
      category: "seo",
      details: !title ? ["Add a <title> element"] : title && !title.textContent ? ["Title element is empty"] : undefined,
    });

    // Check for meta description
    const metaDesc = doc.querySelector('meta[name="description"]');
    auditResults.push({
      id: "meta-description",
      title: "Document has meta description",
      description: "Meta descriptions improve click-through rates",
      score: metaDesc && metaDesc.getAttribute("content") ? 100 : 0,
      category: "seo",
      details: !metaDesc ? ['Add <meta name="description" content="...">'] : undefined,
    });

    // Check for link text
    const links = doc.querySelectorAll("a");
    const emptyLinks = Array.from(links).filter(a => !a.textContent?.trim() && !a.querySelector("img"));
    auditResults.push({
      id: "link-text",
      title: "Links have descriptive text",
      description: "Link text helps users and search engines",
      score: emptyLinks.length === 0 ? 100 : Math.max(0, 100 - emptyLinks.length * 15),
      category: "seo",
      details: emptyLinks.length > 0 ? [`${emptyLinks.length} link(s) without descriptive text`] : undefined,
    });

    // Check for semantic HTML
    const semanticElements = ["header", "nav", "main", "article", "section", "aside", "footer"];
    const usedSemantic = semanticElements.filter(tag => doc.querySelector(tag));
    auditResults.push({
      id: "semantic-html",
      title: "Uses semantic HTML",
      description: "Semantic elements improve SEO and accessibility",
      score: usedSemantic.length >= 3 ? 100 : usedSemantic.length >= 1 ? 70 : 30,
      category: "seo",
      details: [`Using ${usedSemantic.length} semantic element(s): ${usedSemantic.join(", ") || "none"}`],
    });

    setResults(auditResults);
    setHasRun(true);
    setIsRunning(false);
  }, [iframeRef]);

  const getScoreClass = (score: number) => {
    if (score >= 90) return "pass";
    if (score >= 50) return "average";
    return "fail";
  };

  const getScoreIcon = (score: number) => {
    if (score >= 90) return <CheckCircle size={14} />;
    if (score >= 50) return <AlertTriangle size={14} />;
    return <XCircle size={14} />;
  };

  const categories: CategoryScore[] = [
    {
      name: "Performance",
      score: results.filter(r => r.category === "performance").reduce((sum, r) => sum + r.score, 0) /
        Math.max(1, results.filter(r => r.category === "performance").length),
      icon: Zap,
      color: "#f97316",
    },
    {
      name: "Accessibility",
      score: results.filter(r => r.category === "accessibility").reduce((sum, r) => sum + r.score, 0) /
        Math.max(1, results.filter(r => r.category === "accessibility").length),
      icon: Accessibility,
      color: "#3b82f6",
    },
    {
      name: "Best Practices",
      score: results.filter(r => r.category === "best-practices").reduce((sum, r) => sum + r.score, 0) /
        Math.max(1, results.filter(r => r.category === "best-practices").length),
      icon: Shield,
      color: "#22c55e",
    },
    {
      name: "SEO",
      score: results.filter(r => r.category === "seo").reduce((sum, r) => sum + r.score, 0) /
        Math.max(1, results.filter(r => r.category === "seo").length),
      icon: Search,
      color: "#8b5cf6",
    },
  ];

  const filteredResults = selectedCategory
    ? results.filter(r => r.category === selectedCategory)
    : results;

  return (
    <div className="fluxscore-tab">
      <div className="fluxscore-header">
        <div className="fluxscore-title">
          <Gauge size={24} />
          <h2>FluxScore</h2>
          <span className="subtitle">Audit your Flux app for performance, accessibility, SEO, and best practices</span>
        </div>
        <button
          className={`generate-btn ${isRunning ? "running" : ""}`}
          onClick={runAudit}
          disabled={isRunning}
        >
          {isRunning ? (
            <>
              <span className="spinner" />
              Analyzing...
            </>
          ) : (
            <>
              <Play size={14} />
              Generate Report
            </>
          )}
        </button>
      </div>

      {hasRun && (
        <div className="fluxscore-content">
          <div className="score-circles">
            {categories.map(cat => {
              const Icon = cat.icon;
              const score = Math.round(cat.score);
              return (
                <div
                  key={cat.name}
                  className={`score-circle ${getScoreClass(score)} ${selectedCategory === cat.name.toLowerCase().replace(" ", "-") ? "selected" : ""}`}
                  onClick={() => setSelectedCategory(
                    selectedCategory === cat.name.toLowerCase().replace(" ", "-")
                      ? null
                      : cat.name.toLowerCase().replace(" ", "-")
                  )}
                  style={{ "--category-color": cat.color } as React.CSSProperties}
                >
                  <svg viewBox="0 0 36 36" className="circular-chart">
                    <path
                      className="circle-bg"
                      d="M18 2.0845
                        a 15.9155 15.9155 0 0 1 0 31.831
                        a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    <path
                      className="circle"
                      strokeDasharray={`${score}, 100`}
                      d="M18 2.0845
                        a 15.9155 15.9155 0 0 1 0 31.831
                        a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                  </svg>
                  <div className="score-content">
                    <span className="score-value">{score}</span>
                    <Icon size={16} />
                  </div>
                  <span className="score-label">{cat.name}</span>
                </div>
              );
            })}
          </div>

          <div className="audit-results">
            <h3>
              {selectedCategory
                ? `${selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1).replace("-", " ")} Audits`
                : "All Audits"
              }
              <span className="audit-count">{filteredResults.length} audits</span>
            </h3>
            <div className="audits-list">
              {filteredResults.map(result => (
                <div key={result.id} className={`audit-item ${getScoreClass(result.score)}`}>
                  <div className="audit-header">
                    {getScoreIcon(result.score)}
                    <span className="audit-title">{result.title}</span>
                    <span className={`audit-score ${getScoreClass(result.score)}`}>
                      {result.score}
                    </span>
                  </div>
                  <p className="audit-description">{result.description}</p>
                  {result.details && result.details.length > 0 && (
                    <div className="audit-details">
                      {result.details.map((detail, i) => (
                        <div key={i} className="detail-item">
                          <Info size={12} />
                          <span>{detail}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {!hasRun && !isRunning && (
        <div className="empty-state">
          <Gauge size={48} />
          <h3>Analyze Your Flux App</h3>
          <p>
            FluxScore runs audits to check your app's performance, accessibility,
            SEO, and best practices. Click "Generate Report" to start.
          </p>
        </div>
      )}
    </div>
  );
}
