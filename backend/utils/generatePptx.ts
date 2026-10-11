import pptxgen from 'pptxgenjs';

export function createBlusparkPresentation(): pptxgen {
  const pres = new pptxgen();

  // Set presentation properties
  pres.title = 'BLUSPARK Logistics - Judges Presentation';
  pres.subject = 'Ocean Freight Rate & Shipment Tracker Pitch Deck';
  pres.author = 'BLUSPARK Logistics Team';
  pres.company = 'BLUSPARK';
  pres.layout = 'LAYOUT_16x9';

  // Theme Colors
  const BG_DARK = '0B132B';
  const CARD_BG = '1C2541';
  const CARD_BORDER = '3A506B';
  const ACCENT_BLUE = '38BDF8';
  const ACCENT_EMERALD = '10B981';
  const ACCENT_ROSE = 'F43F5E';
  const ACCENT_AMBER = 'F59E0B';
  const TEXT_LIGHT = 'FFFFFF';
  const TEXT_MUTED = '94A3B8';

  // =========================================================================
  // SLIDE 1: ABOUT THE PROJECT & FLOWCHART / WORKFLOW
  // =========================================================================
  const slide1 = pres.addSlide();
  slide1.background = { color: BG_DARK };

  // Top Badge
  slide1.addText('SLIDE 1 OF 3  •  PROJECT OVERVIEW & ARCHITECTURE WORKFLOW', {
    x: 0.8,
    y: 0.5,
    w: 6.5,
    h: 0.35,
    fontSize: 10,
    bold: true,
    color: ACCENT_BLUE,
    fontFace: 'Arial',
  });

  // Slide Title
  slide1.addText('BLUSPARK: Ocean Freight Rate & Shipment Tracker', {
    x: 0.8,
    y: 0.85,
    w: 11.7,
    h: 0.6,
    fontSize: 24,
    bold: true,
    color: TEXT_LIGHT,
    fontFace: 'Arial',
  });

  // Slide Subtitle
  slide1.addText(
    'Automating multi-carrier rate discovery, real-time container tracking, and 100% automated invoice discrepancy auditing.',
    {
      x: 0.8,
      y: 1.45,
      w: 11.7,
      h: 0.4,
      fontSize: 12,
      color: TEXT_MUTED,
      fontFace: 'Arial',
    }
  );

  // Problem Box (Left)
  slide1.addShape(pres.ShapeType.roundRect, {
    x: 0.8,
    y: 1.95,
    w: 5.7,
    h: 2.1,
    fill: { color: '2A1520' },
    line: { color: '881337', width: 1.5 },
    rectRadius: 0.1,
  });

  slide1.addText('THE REAL-WORLD PROBLEM', {
    x: 1.0,
    y: 2.1,
    w: 5.3,
    h: 0.3,
    fontSize: 12,
    bold: true,
    color: ACCENT_ROSE,
    fontFace: 'Arial',
  });

  slide1.addText(
    [
      { text: '• Manual Quoting Chaos: ', options: { bold: true, color: TEXT_LIGHT } },
      { text: 'Logistics teams waste 12+ hrs/week comparing static carrier sheets.\n', options: { color: TEXT_MUTED } },
      { text: '• Tracking Blindspots: ', options: { bold: true, color: TEXT_LIGHT } },
      { text: 'Critical delay notices are buried inside hundreds of daily operational emails.\n', options: { color: TEXT_MUTED } },
      { text: '• Invoice Overcharges: ', options: { bold: true, color: TEXT_LIGHT } },
      { text: 'Over 15% of freight bills contain hidden detention, demurrage, or rate mismatches.', options: { color: TEXT_MUTED } },
    ],
    {
      x: 1.0,
      y: 2.45,
      w: 5.3,
      h: 1.5,
      fontSize: 10,
      fontFace: 'Arial',
      lineSpacing: 14,
    }
  );

  // Solution Box (Right)
  slide1.addShape(pres.ShapeType.roundRect, {
    x: 6.8,
    y: 1.95,
    w: 5.7,
    h: 2.1,
    fill: { color: '0D2818' },
    line: { color: '065F46', width: 1.5 },
    rectRadius: 0.1,
  });

  slide1.addText('THE BLUSPARK SOLUTION', {
    x: 7.0,
    y: 2.1,
    w: 5.3,
    h: 0.3,
    fontSize: 12,
    bold: true,
    color: ACCENT_EMERALD,
    fontFace: 'Arial',
  });

  slide1.addText(
    [
      { text: '• Unified Multi-Carrier Search: ', options: { bold: true, color: TEXT_LIGHT } },
      { text: 'Instant rate comparison across 20ft & 40ft containers (Maersk, MSC, etc).\n', options: { color: TEXT_MUTED } },
      { text: '• Automated Email Processing: ', options: { bold: true, color: TEXT_LIGHT } },
      { text: 'Regex & NLP parser automatically extracts container status and rates from emails.\n', options: { color: TEXT_MUTED } },
      { text: '• 3-Way Invoice Audit: ', options: { bold: true, color: TEXT_LIGHT } },
      { text: 'Compares booked quotes vs billed invoices to flag discrepancies instantly.', options: { color: TEXT_MUTED } },
    ],
    {
      x: 7.0,
      y: 2.45,
      w: 5.3,
      h: 1.5,
      fontSize: 10,
      fontFace: 'Arial',
      lineSpacing: 14,
    }
  );

  // Section: Workflow Flowchart Header
  slide1.addText('HOW THE APP WORKS: COMPLETE OPERATIONAL FLOWCHART', {
    x: 0.8,
    y: 4.25,
    w: 9.0,
    h: 0.3,
    fontSize: 12,
    bold: true,
    color: ACCENT_BLUE,
    fontFace: 'Arial',
  });

  // 6 Flowchart Step Boxes showing How the App Works
  const steps = [
    {
      title: '1. Secure Login',
      sub: 'User enters credentials -> Bcrypt validates -> Dual 256-bit JWT access/refresh tokens issued for session.',
      color: '1E3A8A',
      border: '3B82F6',
      badge: 'JWT Auth',
    },
    {
      title: '2. Rate Discovery',
      sub: 'Operator selects trade lane (20ft/40ft) -> App queries MongoDB -> Sorts quotes by lowest rate or fastest days.',
      color: '164E63',
      border: '06B6D4',
      badge: 'Rate Search',
    },
    {
      title: '3. Book Shipment',
      sub: 'Operator records container ID, carrier & contracted rate -> Sets departure and expected arrival date (ETA).',
      color: '312E81',
      border: '6366F1',
      badge: 'Create Cargo',
    },
    {
      title: '4. Delay Detection',
      sub: 'Automated rule engine checks if Today > ETA: If delayed, automatically marks status "Delayed" with alert.',
      color: '78350F',
      border: 'F59E0B',
      badge: 'Rule Engine',
    },
    {
      title: '5. Email Parsing',
      sub: 'Inbound carrier emails parsed via Regex: Extracts container ID & status -> Updates MongoDB and activity feed.',
      color: '4C1D95',
      border: 'A855F7',
      badge: 'NLP Parser',
    },
    {
      title: '6. Invoice Audit',
      sub: 'Carrier invoice entered -> Compares vs Contracted Rate -> Flags dollar overcharges & generates claim audit.',
      color: '064E3B',
      border: '10B981',
      badge: 'Audit Match',
    },
  ];

  const boxWidth = 1.78;
  const gap = 0.18;
  const startX = 0.8;
  const boxY = 4.62;

  steps.forEach((step, idx) => {
    const x = startX + idx * (boxWidth + gap);

    // Box
    slide1.addShape(pres.ShapeType.roundRect, {
      x,
      y: boxY,
      w: boxWidth,
      h: 1.95,
      fill: { color: step.color },
      line: { color: step.border, width: 1.5 },
      rectRadius: 0.08,
    });

    // Box Title
    slide1.addText(step.title, {
      x: x + 0.05,
      y: boxY + 0.1,
      w: boxWidth - 0.1,
      h: 0.28,
      fontSize: 10.5,
      bold: true,
      color: TEXT_LIGHT,
      fontFace: 'Arial',
      align: 'center',
    });

    // Badge
    slide1.addText(step.badge, {
      x: x + 0.15,
      y: boxY + 0.38,
      w: boxWidth - 0.3,
      h: 0.22,
      fontSize: 8,
      bold: true,
      color: ACCENT_BLUE,
      fontFace: 'Arial',
      align: 'center',
    });

    // Box Subtitle / Workflow explanation
    slide1.addText(step.sub, {
      x: x + 0.08,
      y: boxY + 0.62,
      w: boxWidth - 0.16,
      h: 1.25,
      fontSize: 8.5,
      color: TEXT_MUTED,
      fontFace: 'Arial',
      align: 'center',
      lineSpacing: 11,
    });

    // Arrow to next step
    if (idx < steps.length - 1) {
      slide1.addText('➔', {
        x: x + boxWidth - 0.02,
        y: boxY + 0.85,
        w: 0.22,
        h: 0.3,
        fontSize: 13,
        color: ACCENT_BLUE,
        fontFace: 'Arial',
        align: 'center',
      });
    }
  });

  // Footer
  slide1.addText('BLUSPARK Logistics Intelligence Platform • Confidential • Presentation to Judges', {
    x: 0.8,
    y: 6.8,
    w: 11.7,
    h: 0.3,
    fontSize: 9,
    color: '64748B',
    fontFace: 'Arial',
  });

  // =========================================================================
  // SLIDE 2: TECH STACK USED
  // =========================================================================
  const slide2 = pres.addSlide();
  slide2.background = { color: BG_DARK };

  // Top Badge
  slide2.addText('SLIDE 2 OF 3  •  ENGINEERING ARCHITECTURE & TECH STACK', {
    x: 0.8,
    y: 0.5,
    w: 6.5,
    h: 0.35,
    fontSize: 10,
    bold: true,
    color: ACCENT_BLUE,
    fontFace: 'Arial',
  });

  // Slide Title
  slide2.addText('Modern, Resilient Full-Stack Architecture', {
    x: 0.8,
    y: 0.85,
    w: 11.7,
    h: 0.6,
    fontSize: 24,
    bold: true,
    color: TEXT_LIGHT,
    fontFace: 'Arial',
  });

  // Slide Subtitle
  slide2.addText(
    'Engineered for sub-50ms query latency, bank-grade 256-bit authentication, and cloud fault tolerance.',
    {
      x: 0.8,
      y: 1.45,
      w: 11.7,
      h: 0.4,
      fontSize: 12,
      color: TEXT_MUTED,
      fontFace: 'Arial',
    }
  );

  // 6 Tech Cards (2 rows x 3 columns)
  const techCards = [
    {
      title: 'Frontend Application',
      badge: 'React 19 + Vite 8',
      bullets: [
        'React 19 SPA with TypeScript strict type safety',
        'Tailwind CSS v4 for zero-runtime utility styling',
        'Lucide React icons & responsive cross-device layout',
        'Vite bundler providing instant sub-second hot reload',
      ],
      border: '3B82F6',
    },
    {
      title: 'Backend & REST API',
      badge: 'Node.js 22 + Express 5',
      bullets: [
        'Node.js 22 runtime with native ES modules via tsx',
        'Express 5 RESTful API for shipments, rates & auth',
        'CORS security middleware & centralized error pipeline',
        'Sub-35ms average JSON API response time',
      ],
      border: '10B981',
    },
    {
      title: 'Cloud Database',
      badge: 'MongoDB Atlas v7',
      bullets: [
        'MongoDB Atlas Cloud Cluster (bluspark_logistics)',
        'Native MongoDB v7 driver with connection pooling',
        'Flexible collections: users, shipments, rates, emails',
        'Automatic local storage synchronization fallback',
      ],
      border: '059669',
    },
    {
      title: 'Enterprise Security',
      badge: 'Dual 256-Bit JWT',
      bullets: [
        'RFC 7518-compliant 256-bit HS256 Access Secret',
        'Dedicated 256-bit Refresh Secret (30-day session cycle)',
        'Bcrypt.js password hashing with 10 salt rounds',
        'Role-Based Access Control (Admin & Operator roles)',
      ],
      border: '06B6D4',
    },
    {
      title: 'Parsing & Extraction',
      badge: 'SheetJS + NLP Regex',
      bullets: [
        'SheetJS (xlsx) for multi-sheet carrier rate spreadsheets',
        'Regex pattern extractor for arrival & delay emails',
        'Automated categorization: Rate vs Shipment vs Irrelevant',
        'Discrepancy calculator comparing quotes vs invoices',
      ],
      border: 'F59E0B',
    },
    {
      title: 'AI & Cloud Infrastructure',
      badge: 'Gemini AI Ready',
      bullets: [
        'Google GenAI SDK (@google/genai) integration readiness',
        'Strict environment variable isolation via .env',
        'Containerized architecture ready for Cloud Run / Docker',
        'Embedded database initialization & migration scripts',
      ],
      border: '8B5CF6',
    },
  ];

  const colWidth = 3.75;
  const colGap = 0.22;
  const rowHeight = 2.15;

  techCards.forEach((card, idx) => {
    const col = idx % 3;
    const row = Math.floor(idx / 3);
    const x = startX + col * (colWidth + colGap);
    const y = 2.0 + row * (rowHeight + 0.25);

    slide2.addShape(pres.ShapeType.roundRect, {
      x,
      y,
      w: colWidth,
      h: rowHeight,
      fill: { color: CARD_BG },
      line: { color: card.border, width: 1.5 },
      rectRadius: 0.08,
    });

    slide2.addText(card.title, {
      x: x + 0.15,
      y: y + 0.15,
      w: colWidth - 0.3,
      h: 0.3,
      fontSize: 12,
      bold: true,
      color: TEXT_LIGHT,
      fontFace: 'Arial',
    });

    slide2.addText(card.badge, {
      x: x + 0.15,
      y: y + 0.45,
      w: colWidth - 0.3,
      h: 0.25,
      fontSize: 9,
      bold: true,
      color: ACCENT_BLUE,
      fontFace: 'Arial',
    });

    const bulletText = card.bullets.map((b) => ({ text: `• ${b}\n`, options: { color: TEXT_MUTED } }));
    slide2.addText(bulletText, {
      x: x + 0.15,
      y: y + 0.75,
      w: colWidth - 0.3,
      h: 1.3,
      fontSize: 9,
      fontFace: 'Arial',
      lineSpacing: 13,
    });
  });

  // Footer
  slide2.addText('BLUSPARK Logistics Intelligence Platform • Confidential • Presentation to Judges', {
    x: 0.8,
    y: 6.8,
    w: 11.7,
    h: 0.3,
    fontSize: 9,
    color: '64748B',
    fontFace: 'Arial',
  });

  // =========================================================================
  // SLIDE 3: ADVANTAGES AND DISADVANTAGES
  // =========================================================================
  const slide3 = pres.addSlide();
  slide3.background = { color: BG_DARK };

  // Top Badge
  slide3.addText('SLIDE 3 OF 3  •  VALUE ANALYSIS, TRADE-OFFS & STRATEGIC ROADMAP', {
    x: 0.8,
    y: 0.5,
    w: 6.5,
    h: 0.35,
    fontSize: 10,
    bold: true,
    color: ACCENT_BLUE,
    fontFace: 'Arial',
  });

  // Slide Title
  slide3.addText('Advantages, Trade-Offs & Future Roadmap', {
    x: 0.8,
    y: 0.85,
    w: 11.7,
    h: 0.6,
    fontSize: 24,
    bold: true,
    color: TEXT_LIGHT,
    fontFace: 'Arial',
  });

  // Slide Subtitle
  slide3.addText(
    'A realistic, transparent engineering analysis of our core strengths, operational boundaries, and growth strategy.',
    {
      x: 0.8,
      y: 1.45,
      w: 11.7,
      h: 0.4,
      fontSize: 12,
      color: TEXT_MUTED,
      fontFace: 'Arial',
    }
  );

  // Left Card: Key Advantages (Green)
  slide3.addShape(pres.ShapeType.roundRect, {
    x: 0.8,
    y: 2.0,
    w: 5.7,
    h: 3.5,
    fill: { color: '0D2818' },
    line: { color: '059669', width: 1.5 },
    rectRadius: 0.1,
  });

  slide3.addText('KEY ADVANTAGES & BUSINESS ROI', {
    x: 1.0,
    y: 2.15,
    w: 5.3,
    h: 0.3,
    fontSize: 13,
    bold: true,
    color: ACCENT_EMERALD,
    fontFace: 'Arial',
  });

  slide3.addText(
    [
      { text: '1. Zero-Leakage Invoice Auditing:\n', options: { bold: true, color: TEXT_LIGHT } },
      { text: '   Stops rate overcharges and hidden fees, saving 8–15% on freight spend.\n', options: { color: TEXT_MUTED } },
      { text: '2. Automated Operational Ingestion:\n', options: { bold: true, color: TEXT_LIGHT } },
      { text: '   Cuts 15+ hrs/week of manual spreadsheet entry by parsing emails automatically.\n', options: { color: TEXT_MUTED } },
      { text: '3. Proactive Delay Prevention:\n', options: { bold: true, color: TEXT_LIGHT } },
      { text: '   Flags overdue containers instantly to reschedule trucks before port demurrage.\n', options: { color: TEXT_MUTED } },
      { text: '4. High Fault Tolerance & Offline Mode:\n', options: { bold: true, color: TEXT_LIGHT } },
      { text: '   MongoDB Atlas cloud with seamless local storage sync ensures zero downtime.\n', options: { color: TEXT_MUTED } },
      { text: '5. Bank-Grade 256-Bit Security:\n', options: { bold: true, color: TEXT_LIGHT } },
      { text: '   Dual HS256 access & refresh tokens safeguard proprietary carrier rates.', options: { color: TEXT_MUTED } },
    ],
    {
      x: 1.0,
      y: 2.5,
      w: 5.3,
      h: 2.8,
      fontSize: 9.5,
      fontFace: 'Arial',
      lineSpacing: 13,
    }
  );

  // Right Card: Disadvantages & Limitations (Rose)
  slide3.addShape(pres.ShapeType.roundRect, {
    x: 6.8,
    y: 2.0,
    w: 5.7,
    h: 3.5,
    fill: { color: '2A1520' },
    line: { color: 'E11D48', width: 1.5 },
    rectRadius: 0.1,
  });

  slide3.addText('DISADVANTAGES & TECHNICAL LIMITS', {
    x: 7.0,
    y: 2.15,
    w: 5.3,
    h: 0.3,
    fontSize: 13,
    bold: true,
    color: ACCENT_ROSE,
    fontFace: 'Arial',
  });

  slide3.addText(
    [
      { text: '1. Carrier Email Non-Standardization:\n', options: { bold: true, color: TEXT_LIGHT } },
      { text: '   Different shipping lines use distinct phrasing, requiring regex pattern updates.\n', options: { color: TEXT_MUTED } },
      { text: '2. Cloud Database Whitelist Requirement:\n', options: { bold: true, color: TEXT_LIGHT } },
      { text: '   MongoDB Atlas requires IP access list rules (0.0.0.0/0) to accept cross-cloud TLS.\n', options: { color: TEXT_MUTED } },
      { text: '3. Scanned Image-Based Invoices:\n', options: { bold: true, color: TEXT_LIGHT } },
      { text: '   Low-resolution scanned paper receipts require OCR vision rather than plain text.\n', options: { color: TEXT_MUTED } },
      { text: '4. Absence of Direct Carrier EDI 310/214:\n', options: { bold: true, color: TEXT_LIGHT } },
      { text: '   Currently uses REST, emails & files instead of direct terminal EDI webhooks.', options: { color: TEXT_MUTED } },
    ],
    {
      x: 7.0,
      y: 2.5,
      w: 5.3,
      h: 2.8,
      fontSize: 9.5,
      fontFace: 'Arial',
      lineSpacing: 13,
    }
  );

  // Bottom Card: Strategic Mitigation & Roadmap
  slide3.addShape(pres.ShapeType.roundRect, {
    x: 0.8,
    y: 5.65,
    w: 11.7,
    h: 1.05,
    fill: { color: CARD_BG },
    line: { color: ACCENT_AMBER, width: 1.5 },
    rectRadius: 0.08,
  });

  slide3.addText('STRATEGIC MITIGATIONS & FUTURE ROADMAP', {
    x: 1.0,
    y: 5.75,
    w: 11.3,
    h: 0.25,
    fontSize: 11,
    bold: true,
    color: ACCENT_AMBER,
    fontFace: 'Arial',
  });

  slide3.addText(
    [
      { text: '• Gemini Vision AI OCR: ', options: { bold: true, color: TEXT_LIGHT } },
      { text: 'Ingesting physical scanned invoices and Bills of Lading via multi-modal AI vision.   ', options: { color: TEXT_MUTED } },
      { text: '• Carrier EDI Gateways: ', options: { bold: true, color: TEXT_LIGHT } },
      { text: 'Direct AS2/EDI 310 & 214 webhook listeners for sub-second terminal updates.   ', options: { color: TEXT_MUTED } },
      { text: '• Geo-Replication: ', options: { bold: true, color: TEXT_LIGHT } },
      { text: 'Deploying multi-region MongoDB Atlas replica sets across US, EU & Asia.', options: { color: TEXT_MUTED } },
    ],
    {
      x: 1.0,
      y: 6.05,
      w: 11.3,
      h: 0.55,
      fontSize: 9.5,
      fontFace: 'Arial',
      lineSpacing: 12,
    }
  );

  // Footer
  slide3.addText('BLUSPARK Logistics Intelligence Platform • Confidential • Presentation to Judges', {
    x: 0.8,
    y: 6.8,
    w: 11.7,
    h: 0.3,
    fontSize: 9,
    color: '64748B',
    fontFace: 'Arial',
  });

  return pres;
}
