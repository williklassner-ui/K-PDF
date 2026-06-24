import React, { useRef, useCallback, forwardRef, useImperativeHandle } from 'react';
import { View, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';
import { Colors } from '@/constants/colors';

const PDF_VIEWER_HTML = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,user-scalable=no">
<style>
*{margin:0;padding:0;box-sizing:border-box}
html,body{width:100%;height:100%;overflow-x:hidden;background:#1a1a1a;scroll-behavior:smooth}
#viewer{display:flex;flex-direction:column;align-items:center;padding:8px 0;min-height:100vh}
.page-wrapper{margin:6px 0;position:relative;box-shadow:0 2px 12px rgba(0,0,0,0.6)}
canvas{display:block}
.page-num{position:absolute;bottom:4px;right:6px;background:rgba(0,0,0,0.55);color:#fff;font-size:11px;padding:2px 6px;border-radius:4px;pointer-events:none}
#loading{position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);color:#fff;font-family:sans-serif;font-size:16px;text-align:center}
</style>
</head>
<body>
<div id="loading">Lade PDF...</div>
<div id="viewer"></div>
<script>
const cdnBase = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/';
const script = document.createElement('script');
script.src = cdnBase + 'pdf.min.js';
script.onload = () => {
  pdfjsLib.GlobalWorkerOptions.workerSrc = cdnBase + 'pdf.worker.min.js';
  init();
};
document.head.appendChild(script);

let pdfDoc = null;
let currentPage = 1;
let renderTasks = {};
let currentScale = 1.0;
let pinchStartDist = 0;
let pinchBaseScale = 1.0;
let pinchLastScale = 1.0;
let scrollTimer = null;
let tapT = 0, tapMoved = false;

function init() {
  window.addEventListener('message', handleMessage);
  document.addEventListener('message', handleMessage);
  setupScrollTracking();
  setupGestures();
  postToApp({type:'ready'});
}

function handleMessage(e) {
  let msg;
  try { msg = JSON.parse(e.data); } catch { return; }
  if (msg.type === 'load') loadPDF(msg.base64);
  else if (msg.type === 'goTo') scrollToPage(msg.page);
  else if (msg.type === 'zoom') rerenderAllPages(msg.scale);
  else if (msg.type === 'search') performSearch(msg.query);
  else if (msg.type === 'clearSearch') clearSearch();
  else if (msg.type === 'nextSearch') navigateSearch(1);
  else if (msg.type === 'prevSearch') navigateSearch(-1);
}

function postToApp(data) {
  try { window.ReactNativeWebView.postMessage(JSON.stringify(data)); } catch {}
}

async function loadPDF(base64) {
  document.getElementById('loading').style.display = 'block';
  document.getElementById('viewer').innerHTML = '';
  renderTasks = {};
  currentScale = 1.0;
  try {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    pdfDoc = await pdfjsLib.getDocument({data:bytes,cMapUrl:cdnBase+'cmaps/',cMapPacked:true}).promise;
    document.getElementById('loading').style.display = 'none';
    postToApp({type:'loaded', numPages: pdfDoc.numPages});
    for (let i = 1; i <= pdfDoc.numPages; i++) await renderPage(i, currentScale);
  } catch(err) {
    document.getElementById('loading').textContent = 'Fehler: ' + err.message;
    postToApp({type:'error', message: err.message});
  }
}

async function renderPage(num, scale) {
  const page = await pdfDoc.getPage(num);
  const vw = window.innerWidth - 16;
  const naturalW = page.getViewport({scale:1}).width;
  const viewport = page.getViewport({scale: (vw / naturalW) * scale});

  const wrapper = document.createElement('div');
  wrapper.className = 'page-wrapper';
  wrapper.id = 'page-' + num;
  wrapper.dataset.page = num;
  const canvas = document.createElement('canvas');
  canvas.width = viewport.width;
  canvas.height = viewport.height;
  const label = document.createElement('div');
  label.className = 'page-num';
  label.textContent = num;
  wrapper.appendChild(canvas);
  wrapper.appendChild(label);
  document.getElementById('viewer').appendChild(wrapper);

  observer.observe(wrapper);

  const ctx = canvas.getContext('2d');
  const task = page.render({canvasContext:ctx, viewport});
  renderTasks[num] = task;
  try { await task.promise; } catch {}
  delete renderTasks[num];
}

async function rerenderPage(num, scale) {
  const wrapper = document.getElementById('page-' + num);
  if (!wrapper) return;
  const canvas = wrapper.querySelector('canvas');
  if (!canvas) return;

  const page = await pdfDoc.getPage(num);
  const vw = window.innerWidth - 16;
  const naturalW = page.getViewport({scale:1}).width;
  const viewport = page.getViewport({scale: (vw / naturalW) * scale});
  canvas.width = viewport.width;
  canvas.height = viewport.height;

  if (renderTasks[num]) { try { renderTasks[num].cancel(); } catch {} }
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const task = page.render({canvasContext:ctx, viewport});
  renderTasks[num] = task;
  try { await task.promise; } catch {}
  delete renderTasks[num];
}

async function rerenderAllPages(scale) {
  if (!pdfDoc) return;
  const s = Math.max(0.5, Math.min(4, scale));
  currentScale = s;
  pinchBaseScale = s;
  pinchLastScale = s;
  const scrollY = window.scrollY;
  // Cancel all in-flight renders
  for (const k in renderTasks) { try { renderTasks[k].cancel(); } catch {} }
  renderTasks = {};
  for (let i = 1; i <= pdfDoc.numPages; i++) await rerenderPage(i, s);
  window.scrollTo(0, scrollY);
}

function scrollToPage(num) {
  const el = document.getElementById('page-' + num);
  if (!el) return;
  el.scrollIntoView({behavior:'instant', block:'start'});
  if (num !== currentPage) {
    currentPage = num;
    postToApp({type:'pageChanged', page: num});
  }
}

// Page tracking via scroll events (primary) + IntersectionObserver (backup)
function setupScrollTracking() {
  document.addEventListener('scroll', () => {
    clearTimeout(scrollTimer);
    scrollTimer = setTimeout(() => {
      const wrappers = document.querySelectorAll('.page-wrapper');
      for (const w of wrappers) {
        const rect = w.getBoundingClientRect();
        if (rect.top >= -(rect.height * 0.5) && rect.top < window.innerHeight * 0.5) {
          const p = parseInt(w.dataset.page);
          if (p !== currentPage) {
            currentPage = p;
            postToApp({type:'pageChanged', page: p});
          }
          break;
        }
      }
    }, 80);
  }, {passive:true});
}

const observer = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting && e.intersectionRatio > 0.4) {
      const p = parseInt(e.target.dataset.page);
      if (p !== currentPage) {
        currentPage = p;
        postToApp({type:'pageChanged', page: p});
      }
    }
  });
}, {threshold:0.4});

// Tap + Pinch gesture handling
function setupGestures() {
  // Tap detection
  document.addEventListener('touchstart', e => {
    if (e.touches.length === 1) { tapT = Date.now(); tapMoved = false; }
    if (e.touches.length === 2) {
      tapT = 0; // cancel tap if pinch starts
      pinchStartDist = Math.hypot(
        e.touches[1].clientX - e.touches[0].clientX,
        e.touches[1].clientY - e.touches[0].clientY
      );
      pinchBaseScale = currentScale;
      pinchLastScale = currentScale;
    }
  }, {passive:true});

  document.addEventListener('touchmove', e => {
    if (e.touches.length === 1) { tapMoved = true; }
    if (e.touches.length === 2 && pinchStartDist) {
      const dist = Math.hypot(
        e.touches[1].clientX - e.touches[0].clientX,
        e.touches[1].clientY - e.touches[0].clientY
      );
      pinchLastScale = Math.max(0.5, Math.min(4, pinchBaseScale * dist / pinchStartDist));
      const viewer = document.getElementById('viewer');
      viewer.style.transform = 'scale(' + (pinchLastScale / currentScale) + ')';
      viewer.style.transformOrigin = 'top center';
    }
  }, {passive:true});

  document.addEventListener('touchend', e => {
    // Single tap
    if (e.changedTouches.length === 1 && !tapMoved && tapT > 0 && (Date.now() - tapT) < 250) {
      postToApp({type:'tap'});
    }
    // Pinch end — re-render at final scale
    if (pinchStartDist && e.touches.length < 2) {
      const viewer = document.getElementById('viewer');
      viewer.style.transform = '';
      viewer.style.transformOrigin = '';
      pinchStartDist = 0;
      rerenderAllPages(pinchLastScale);
    }
  }, {passive:true});
}

// Search
let searchMatches = [];
let searchIdx = 0;

async function performSearch(query) {
  clearSearch();
  if (!pdfDoc || !query) return;
  const results = [];
  for (let i = 1; i <= pdfDoc.numPages; i++) {
    const page = await pdfDoc.getPage(i);
    const tc = await page.getTextContent();
    const text = tc.items.map(it => it.str).join(' ');
    if (text.toLowerCase().includes(query.toLowerCase())) results.push({page:i, text});
  }
  searchMatches = results;
  postToApp({type:'searchResults', count:results.length, pages:results.map(r=>r.page)});
  if (results.length > 0) scrollToPage(results[0].page);
}

function navigateSearch(dir) {
  if (!searchMatches.length) return;
  searchIdx = (searchIdx + dir + searchMatches.length) % searchMatches.length;
  scrollToPage(searchMatches[searchIdx].page);
  postToApp({type:'searchIndex', index:searchIdx});
}

function clearSearch() { searchMatches = []; searchIdx = 0; }
</script>
</body>
</html>`;

export interface PDFViewerRef {
  goToPage: (page: number) => void;
  setZoom: (scale: number) => void;
  search: (query: string) => void;
  clearSearch: () => void;
  nextSearch: () => void;
  prevSearch: () => void;
  reload: () => void;
}

interface PDFViewerProps {
  base64?: string;
  onLoaded?: (numPages: number) => void;
  onPageChanged?: (page: number) => void;
  onError?: (message: string) => void;
  onSearchResults?: (count: number, pages: number[]) => void;
  onSearchIndex?: (index: number) => void;
  onTap?: () => void;
  style?: object;
}

const PDFViewer = forwardRef<PDFViewerRef, PDFViewerProps>(
  (
    {
      base64,
      onLoaded,
      onPageChanged,
      onError,
      onSearchResults,
      onSearchIndex,
      onTap,
      style,
    },
    ref
  ) => {
    const webviewRef = useRef<WebView>(null);

    const send = useCallback((msg: object) => {
      webviewRef.current?.injectJavaScript(
        `(function(){window.dispatchEvent(new MessageEvent('message',{data:${JSON.stringify(JSON.stringify(msg))}}))})();true;`
      );
    }, []);

    useImperativeHandle(ref, () => ({
      goToPage: (page) => send({ type: 'goTo', page }),
      setZoom: (scale) => send({ type: 'zoom', scale }),
      search: (query) => send({ type: 'search', query }),
      clearSearch: () => send({ type: 'clearSearch' }),
      nextSearch: () => send({ type: 'nextSearch' }),
      prevSearch: () => send({ type: 'prevSearch' }),
      reload: () => { if (base64) send({ type: 'load', base64 }); },
    }));

    const handleMessage = useCallback(
      (event: { nativeEvent: { data: string } }) => {
        try {
          const msg = JSON.parse(event.nativeEvent.data);
          if (msg.type === 'ready' && base64) {
            send({ type: 'load', base64 });
          } else if (msg.type === 'loaded') {
            onLoaded?.(msg.numPages);
          } else if (msg.type === 'pageChanged') {
            onPageChanged?.(msg.page);
          } else if (msg.type === 'error') {
            onError?.(msg.message);
          } else if (msg.type === 'searchResults') {
            onSearchResults?.(msg.count, msg.pages);
          } else if (msg.type === 'searchIndex') {
            onSearchIndex?.(msg.index);
          } else if (msg.type === 'tap') {
            onTap?.();
          }
        } catch {
          /* ignore */
        }
      },
      [base64, send, onLoaded, onPageChanged, onError, onSearchResults, onSearchIndex, onTap]
    );

    return (
      <View style={[styles.container, style]}>
        <WebView
          ref={webviewRef}
          source={{ html: PDF_VIEWER_HTML }}
          onMessage={handleMessage}
          javaScriptEnabled
          allowFileAccess
          allowUniversalAccessFromFileURLs
          mixedContentMode="always"
          domStorageEnabled
          style={styles.webview}
          scrollEnabled
          showsVerticalScrollIndicator={false}
          bounces={false}
          overScrollMode="never"
          scalesPageToFit={false}
          startInLoadingState={false}
        />
      </View>
    );
  }
);

PDFViewer.displayName = 'PDFViewer';
export default PDFViewer;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.pdfBg,
  },
  webview: {
    flex: 1,
    backgroundColor: 'transparent',
  },
});
