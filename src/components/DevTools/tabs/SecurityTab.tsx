import { useState, useEffect, useCallback } from "react";
import { Shield, ShieldCheck, ShieldAlert, ShieldX, Lock, Unlock, Globe, AlertTriangle, CheckCircle, XCircle } from "lucide-react";

interface SecurityCheck {
  name: string;
  description: string;
  status: "pass" | "warning" | "fail" | "info";
  details: string;
}

interface SecurityTabProps {
  iframeRef: React.RefObject<HTMLIFrameElement>;
}

export function SecurityTab({ iframeRef }: SecurityTabProps) {
  const [checks, setChecks] = useState<SecurityCheck[]>([]);
  const [isSecure, setIsSecure] = useState<boolean | null>(null);
  const [protocol, setProtocol] = useState<string>("");
  const [mixedContent, setMixedContent] = useState<string[]>([]);

  const runSecurityChecks = useCallback(() => {
    const iframe = iframeRef.current;
    if (!iframe?.contentDocument || !iframe?.contentWindow) return;

    const doc = iframe.contentDocument;
    const win = iframe.contentWindow as Window & typeof globalThis;
    const newChecks: SecurityCheck[] = [];

    // Check protocol
    const currentProtocol = win.location.protocol;
    setProtocol(currentProtocol);
    setIsSecure(currentProtocol === "https:" || currentProtocol === "file:");

    // HTTPS Check
    newChecks.push({
      name: "HTTPS",
      description: "Connection is encrypted",
      status: currentProtocol === "https:" ? "pass" : currentProtocol === "file:" ? "info" : "warning",
      details: currentProtocol === "https:"
        ? "This page is served over HTTPS"
        : currentProtocol === "file:"
        ? "Local file - HTTPS not applicable"
        : "This page is not served over HTTPS. Consider using HTTPS for production.",
    });

    // Mixed Content Check
    const insecureResources: string[] = [];
    doc.querySelectorAll("script[src], link[href], img[src], iframe[src]").forEach(el => {
      const src = el.getAttribute("src") || el.getAttribute("href") || "";
      if (src.startsWith("http://")) {
        insecureResources.push(src);
      }
    });
    setMixedContent(insecureResources);

    newChecks.push({
      name: "Mixed Content",
      description: "No insecure resources loaded",
      status: insecureResources.length === 0 ? "pass" : "fail",
      details: insecureResources.length === 0
        ? "No mixed content detected"
        : `Found ${insecureResources.length} insecure resource(s)`,
    });

    // CSP Check
    const cspMeta = doc.querySelector('meta[http-equiv="Content-Security-Policy"]');
    newChecks.push({
      name: "Content Security Policy",
      description: "CSP headers protect against XSS",
      status: cspMeta ? "pass" : "warning",
      details: cspMeta
        ? `CSP defined: ${cspMeta.getAttribute("content")?.slice(0, 100)}...`
        : "No CSP meta tag found. Consider adding a Content-Security-Policy.",
    });

    // X-Frame-Options Check (simulated for preview)
    newChecks.push({
      name: "Clickjacking Protection",
      description: "Page cannot be embedded in iframes",
      status: "info",
      details: "This is a preview iframe. In production, set X-Frame-Options header.",
    });

    // Check for inline scripts
    const inlineScripts = doc.querySelectorAll("script:not([src])");
    const hasInlineHandlers = Array.from(doc.querySelectorAll("*")).some(el =>
      Array.from(el.attributes).some(attr => attr.name.startsWith("on"))
    );

    newChecks.push({
      name: "Inline Scripts",
      description: "Minimize inline JavaScript",
      status: inlineScripts.length === 0 && !hasInlineHandlers ? "pass" : "warning",
      details: inlineScripts.length === 0 && !hasInlineHandlers
        ? "No inline scripts detected"
        : `Found ${inlineScripts.length} inline script(s) and ${hasInlineHandlers ? "inline event handlers" : "no inline handlers"}`,
    });

    // Check for sensitive data in forms
    const passwordFields = doc.querySelectorAll('input[type="password"]');
    const formsWithoutAutocomplete = Array.from(doc.querySelectorAll("form")).filter(
      form => !form.hasAttribute("autocomplete")
    );

    if (passwordFields.length > 0) {
      newChecks.push({
        name: "Password Field Security",
        description: "Password inputs are properly configured",
        status: formsWithoutAutocomplete.length === 0 ? "pass" : "warning",
        details: `Found ${passwordFields.length} password field(s). ${
          formsWithoutAutocomplete.length > 0
            ? "Some forms missing autocomplete attribute."
            : "All forms properly configured."
        }`,
      });
    }

    // Check for external links without rel="noopener"
    const unsafeLinks = Array.from(doc.querySelectorAll('a[target="_blank"]')).filter(
      link => !link.getAttribute("rel")?.includes("noopener")
    );

    newChecks.push({
      name: "External Links",
      description: "Links use rel='noopener'",
      status: unsafeLinks.length === 0 ? "pass" : "warning",
      details: unsafeLinks.length === 0
        ? "All external links are safe"
        : `${unsafeLinks.length} link(s) open in new tab without rel="noopener"`,
    });

    // Check for outdated/vulnerable patterns
    const hasEval = doc.documentElement.innerHTML.includes("eval(");
    const hasInnerHTML = doc.documentElement.innerHTML.includes(".innerHTML");

    newChecks.push({
      name: "Dangerous APIs",
      description: "Avoid eval() and innerHTML",
      status: !hasEval && !hasInnerHTML ? "pass" : "warning",
      details: hasEval
        ? "eval() detected - avoid using eval()"
        : hasInnerHTML
        ? "innerHTML usage detected - prefer textContent or DOM APIs"
        : "No dangerous API usage detected",
    });

    // Check for forms with action URLs
    const externalForms = Array.from(doc.querySelectorAll("form[action]")).filter(
      form => {
        const action = form.getAttribute("action") || "";
        return action.startsWith("http");
      }
    );

    if (externalForms.length > 0) {
      newChecks.push({
        name: "Form Submissions",
        description: "Forms submit to secure endpoints",
        status: externalForms.every(f => f.getAttribute("action")?.startsWith("https")) ? "pass" : "warning",
        details: `Found ${externalForms.length} form(s) with external actions`,
      });
    }

    setChecks(newChecks);
  }, [iframeRef]);

  useEffect(() => {
    runSecurityChecks();
    const iframe = iframeRef.current;
    if (iframe) {
      iframe.addEventListener("load", runSecurityChecks);
      return () => iframe.removeEventListener("load", runSecurityChecks);
    }
  }, [iframeRef, runSecurityChecks]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pass": return <CheckCircle size={14} className="status-icon pass" />;
      case "warning": return <AlertTriangle size={14} className="status-icon warning" />;
      case "fail": return <XCircle size={14} className="status-icon fail" />;
      default: return <Shield size={14} className="status-icon info" />;
    }
  };

  const getOverallStatus = () => {
    const failCount = checks.filter(c => c.status === "fail").length;
    const warnCount = checks.filter(c => c.status === "warning").length;

    if (failCount > 0) return { icon: ShieldX, label: "Security Issues Found", class: "fail" };
    if (warnCount > 0) return { icon: ShieldAlert, label: "Warnings Found", class: "warning" };
    return { icon: ShieldCheck, label: "No Issues Found", class: "pass" };
  };

  const overall = getOverallStatus();
  const OverallIcon = overall.icon;

  return (
    <div className="security-tab">
      <div className="security-overview">
        <div className={`overview-card ${overall.class}`}>
          <OverallIcon size={48} />
          <div className="overview-text">
            <h2>{overall.label}</h2>
            <p>
              {checks.filter(c => c.status === "pass").length} passed,{" "}
              {checks.filter(c => c.status === "warning").length} warnings,{" "}
              {checks.filter(c => c.status === "fail").length} failed
            </p>
          </div>
        </div>

        <div className="connection-info">
          <div className="info-item">
            {isSecure ? <Lock size={16} /> : <Unlock size={16} />}
            <span>
              {isSecure ? "Secure Connection" : "Insecure Connection"}
            </span>
          </div>
          <div className="info-item">
            <Globe size={16} />
            <span>Protocol: {protocol || "unknown"}</span>
          </div>
        </div>
      </div>

      <div className="security-checks">
        <h3>Security Checks</h3>
        <div className="checks-list">
          {checks.map((check, i) => (
            <div key={i} className={`check-item ${check.status}`}>
              <div className="check-header">
                {getStatusIcon(check.status)}
                <span className="check-name">{check.name}</span>
                <span className={`check-badge ${check.status}`}>
                  {check.status.toUpperCase()}
                </span>
              </div>
              <p className="check-description">{check.description}</p>
              <p className="check-details">{check.details}</p>
            </div>
          ))}
        </div>
      </div>

      {mixedContent.length > 0 && (
        <div className="mixed-content-section">
          <h3><AlertTriangle size={16} /> Mixed Content Resources</h3>
          <div className="mixed-content-list">
            {mixedContent.map((url, i) => (
              <div key={i} className="mixed-content-item">
                <XCircle size={12} />
                <span>{url}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="security-tips">
        <h3>Security Best Practices</h3>
        <ul>
          <li>Always use HTTPS in production</li>
          <li>Set Content-Security-Policy headers</li>
          <li>Use rel="noopener" on external links</li>
          <li>Avoid inline scripts and eval()</li>
          <li>Sanitize user input before rendering</li>
          <li>Keep dependencies up to date</li>
        </ul>
      </div>
    </div>
  );
}
