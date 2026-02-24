import { NextResponse } from 'next/server'

export async function GET() {
  const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || ''

  const script = `(function() {
  var BASE_URL = ${JSON.stringify(BASE_URL)};

  function getInitials(name) {
    return name.split(' ').map(function(w) { return w[0]; }).join('').toUpperCase().slice(0, 2);
  }

  function sourceBadge(source) {
    var colors = {
      twitter: { bg: '#e0f2fe', color: '#0369a1' },
      linkedin: { bg: '#dbeafe', color: '#1d4ed8' },
      producthunt: { bg: '#ffedd5', color: '#c2410c' },
      form: { bg: '#dcfce7', color: '#15803d' }
    };
    return colors[source] || { bg: '#f3f4f6', color: '#374151' };
  }

  function sourceLabel(source) {
    var labels = { twitter: 'Twitter', linkedin: 'LinkedIn', producthunt: 'Product Hunt', form: 'Form' };
    return labels[source] || 'Manual';
  }

  function renderCard(t, config) {
    var badge = sourceBadge(t.source);
    var avatarHtml = '';
    if (config.showAvatar !== false) {
      if (t.avatar_url) {
        avatarHtml = '<img src="' + t.avatar_url + '" alt="" style="width:32px;height:32px;border-radius:50%;object-fit:cover;" />';
      } else {
        avatarHtml = '<div style="width:32px;height:32px;border-radius:50%;background:#e0e7ff;color:#4f46e5;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:600;">' + getInitials(t.name) + '</div>';
      }
    }
    var roleHtml = '';
    if (config.showRole !== false && (t.role || t.company)) {
      var parts = [t.role, t.company].filter(Boolean).join(' at ');
      roleHtml = '<p style="font-size:12px;color:' + (config.mutedColor || '#9ca3af') + ';margin:0;">' + parts + '</p>';
    }
    var sourceHtml = '';
    if (config.showSource !== false) {
      sourceHtml = '<span style="display:inline-block;margin-top:8px;padding:2px 8px;border-radius:9999px;font-size:11px;font-weight:500;background:' + badge.bg + ';color:' + badge.color + ';">' + sourceLabel(t.source) + '</span>';
    }
    var bodyFontSize = config.bodyFontSize === 'sm' ? '13px' : config.bodyFontSize === 'lg' ? '17px' : '15px';
    var cardPadding = config.cardPadding === 'compact' ? '12px' : config.cardPadding === 'spacious' ? '32px' : '20px';
    var shadowMap = { none: '', sm: '0 1px 3px rgba(0,0,0,0.1)', md: '0 4px 6px rgba(0,0,0,0.1), 0 2px 4px rgba(0,0,0,0.06)', lg: '0 10px 15px rgba(0,0,0,0.15), 0 4px 6px rgba(0,0,0,0.1)' };
    var cardShadow = shadowMap[config.shadow] || '';
    var cardBorder = config.showBorder !== false ? '1px solid ' + (config.cardBorderColor || '#e5e7eb') : 'none';
    var nameColor = config.nameColor || config.textColor || '#111827';
    return '<div style="background:' + (config.cardBg || '#ffffff') + ';color:' + (config.textColor || '#374151') + ';border-radius:' + (config.borderRadius || 12) + 'px;padding:' + cardPadding + ';border:' + cardBorder + ';box-shadow:' + cardShadow + ';">'
      + (avatarHtml ? '<div style="margin-bottom:8px;">' + avatarHtml + '</div>' : '')
      + '<p style="font-size:' + bodyFontSize + ';line-height:1.5;margin:0 0 8px 0;color:' + (config.textColor || '#374151') + ';">' + t.text + '</p>'
      + '<p style="font-size:14px;font-weight:600;margin:0;color:' + nameColor + ';">' + t.name + '</p>'
      + roleHtml
      + sourceHtml
      + '</div>';
  }

  function renderWidget(testimonials, config) {
    var cols = config.columns || 3;
    var gap = config.gap === 'sm' ? '8px' : config.gap === 'lg' ? '24px' : '16px';
    var widgetBg = config.widgetBg || 'transparent';
    var fontName = config.fontFamily && config.fontFamily !== 'System UI' ? config.fontFamily : null;
    var fontFamily = fontName ? '"' + fontName + '", system-ui, sans-serif' : '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    var fontImport = fontName ? "@import url('https://fonts.googleapis.com/css2?family=" + fontName.replace(/ /g, '+') + ":wght@400;600&display=swap');" : '';
    var items = testimonials.slice(0, config.maxCount || 12);
    var cards = items.map(function(t) { return renderCard(t, config); }).join('');
    return '<style>'
      + fontImport
      + '.kudos-grid { display: grid; grid-template-columns: repeat(' + cols + ', 1fr); gap: ' + gap + '; font-family: ' + fontFamily + '; }'
      + '@media (max-width: 768px) { .kudos-grid { grid-template-columns: 1fr !important; } }'
      + '</style>'
      + '<div style="background:' + widgetBg + ';">'
      + '<div class="kudos-grid">' + cards + '</div>'
      + '</div>';
  }

  function initWidget(el) {
    var widgetId = el.getAttribute('data-kudos-widget');
    if (!widgetId || el._kudosLoaded) return;
    el._kudosLoaded = true;

    fetch(BASE_URL + '/api/widget/' + widgetId)
      .then(function(res) { return res.json(); })
      .then(function(data) {
        var shadow = el.attachShadow({ mode: 'open' });
        shadow.innerHTML = renderWidget(data.testimonials || [], data.config || {});
      })
      .catch(function(err) { console.error('Kudos widget error:', err); });
  }

  document.querySelectorAll('[data-kudos-widget]').forEach(initWidget);

  new MutationObserver(function(mutations) {
    mutations.forEach(function(m) {
      m.addedNodes.forEach(function(node) {
        if (node.nodeType === 1 && node.hasAttribute && node.hasAttribute('data-kudos-widget')) {
          initWidget(node);
        }
      });
    });
  }).observe(document.body, { childList: true, subtree: true });
})();`

  return new NextResponse(script, {
    headers: {
      'Content-Type': 'application/javascript',
      'Cache-Control': 'public, max-age=3600',
    },
  })
}
