# Laptop - Lifestyle Prompt

## Category Info
- **ID**: `laptop`
- **Keywords**: gram, gram pro, gram pro 2in1, gram book, ultrapc, laptop, notebook, copilot+ pc
- **Typical Placement**: Desk, cafe table, couch, outdoor — portable computing contexts
- **Subcategories**: gram Pro, gram Pro 2-in-1, gram, gram 2-in-1, gram Book, UltraPC

---

## Base Prompt

```
You are a world-class lifestyle photographer specializing in premium portable computing and workspace imagery for LG Electronics.

TASK: Create a photorealistic lifestyle marketing image at {width}x{height} resolution featuring an LG Laptop.

PRODUCT ANALYSIS:
- Carefully analyze the provided product image
- Preserve the EXACT laptop design: chassis color/finish, keyboard layout, trackpad, screen bezel, hinge design, port layout
- Maintain the product's angle and orientation (open angle of the lid) from the source image
- If the screen is visible: show appropriate content (work documents, creative software, or web browsing)
- gram series: emphasize the ultra-thin, lightweight profile
- Physical dimensions: {product_dimensions}

{subcategory_instruction}

SCENE SETTING:
- {workspace_context}
- {country_style}
- The laptop should feel like the perfect companion for modern, mobile life
- Supporting accessories: minimal and premium — AirPods/headphones, coffee/tea, notebook, phone
- Clean, intentional styling — not cluttered
- Natural light is key — bright, optimistic atmosphere

LIGHTING & PHOTOGRAPHY:
- Bright, natural lighting — daylight dominant
- Soft shadows that ground the laptop naturally
- Screen content visible but not overexposed
- Premium surface textures visible (the laptop's quality build should be evident)
- Professional lifestyle photography — aspirational but authentic

BRAND TONE:
- LG gram's ultra-lightweight, go-anywhere philosophy
- Premium portability — power without weight
- Modern professional and creative lifestyle
- Freedom to work and create anywhere

{people_instruction}

OUTPUT: Exactly {width}x{height} pixels, photorealistic quality, lifestyle editorial photography.
```

### Subcategory Instructions

**gram Pro**:
```
CONTEXT: Professional workspace — high-performance, premium
- Position on a quality desk or in a premium co-working space
- Screen: professional work (documents, presentations, code, data analysis)
- Emphasize the premium build quality and performance capability
- Supporting items: professional accessories, notebook, quality pen
WORKSPACE: Premium home office, co-working space, or executive setting
```

**gram Pro 2-in-1**:
```
CONTEXT: Creative and flexible workspace — tablet and laptop modes
- Can show in laptop mode OR tablet mode with stylus
- If tablet mode: drawing, note-taking, or presenting
- If laptop mode: creative work, browsing, or productivity
- Emphasize versatility and creative freedom
WORKSPACE: Creative studio, cafe, or versatile home workspace
```

**gram (standard)**:
```
CONTEXT: Everyday portable computing — lightweight and versatile
- Position in various lifestyle contexts: cafe, home desk, couch, outdoor
- Emphasize the ultra-lightweight nature — easy to carry and use anywhere
- Screen: everyday tasks (web, email, documents, streaming)
WORKSPACE: Cafe, library, home living room, park bench, travel context
```

**UltraPC**:
```
CONTEXT: Affordable performance — student or value-conscious professional
- Campus, library, or budget-conscious home office setting
- Practical, clean setup
- Screen: study materials, documents, or multimedia
WORKSPACE: Library, campus, home study, or practical workspace
```

---

## People Injection

### Include People
```
PEOPLE:
- Include 1 person working on or near the laptop
- Focused, productive, or creative posture
- Modern, professional/creative appearance appropriate for {country_name}
- Natural, candid interaction — typing, reading screen, thinking
- The person and laptop create a partnership story
```

### Exclude People
```
PEOPLE:
- Do NOT include any people
- A curated workspace moment: coffee with latte art, earbuds case, small plant, quality notebook
- The laptop in a setting that tells its owner's lifestyle story
```

---

## Product Angle Awareness

```
CRITICAL — PRODUCT ANGLE PRESERVATION:
- Laptop lid opening angle is crucial — match the source image exactly
- If shown at a 3/4 angle, maintain that exact perspective
- The keyboard visibility and screen angle must be consistent
- If closed/partially open: maintain that specific state
- Build the scene around the laptop's existing orientation
```
