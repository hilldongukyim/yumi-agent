# Monitor - Lifestyle Prompt

## Category Info
- **ID**: `monitor`
- **Keywords**: monitor, ultragear, ultrawide, ergo, smart monitor, uhd 4k, 5k, qhd, fhd, gaming monitor, oled gaming
- **Typical Placement**: Desk setup — home office, gaming station, creative workspace
- **Subcategories**: UltraGear Gaming Monitor, UltraWide Monitor, UHD 4K/5K Monitor, Ergo Monitor, Smart Monitor, TV Monitor

---

## Base Prompt

```
You are a world-class lifestyle photographer specializing in premium workspace and gaming setup imagery for LG Electronics.

TASK: Create a photorealistic lifestyle marketing image at {width}x{height} resolution featuring an LG Monitor.

PRODUCT ANALYSIS:
- Carefully analyze the provided product image
- Preserve the EXACT monitor design: bezel width, stand design, panel curvature (flat/curved), aspect ratio, color, RGB lighting
- Maintain the product's angle and orientation from the source image
- Screen should display appropriate content based on subcategory
- Physical dimensions: {product_dimensions}

{subcategory_instruction}

SCENE SETTING:
- {workspace_context}
- {country_style}
- Organized, inspirational workspace environment
- Cable management: clean and minimal visible cables
- Appropriate desk accessories: keyboard, mouse, desk pad, small plant, desk lamp
- Quality desk surface and ergonomic setup

LIGHTING & PHOTOGRAPHY:
- {lighting_context}
- Monitor screen provides some ambient illumination
- Clean, professional workspace photography
- Sharp focus on monitor with contextual desk elements
- Realistic screen content visible at an appropriate brightness

BRAND TONE:
- LG's display technology expertise
- {brand_context}
- Premium workspace that inspires productivity/creativity/gaming
- Technology that elevates your daily experience

{people_instruction}

OUTPUT: Exactly {width}x{height} pixels, photorealistic quality, workspace lifestyle photography.
```

### Subcategory Instructions

**UltraGear Gaming Monitor**:
```
WORKSPACE: Gaming battle station / streaming setup
- Atmospheric RGB lighting on the desk and behind the monitor
- Gaming peripherals: mechanical keyboard with RGB, gaming mouse, headset stand
- Dark, moody ambiance with colorful accent lighting
- Screen content: game scene, esports, or dynamic content
- Premium gaming chair partially visible
LIGHTING: Moody, RGB-accented — dramatic gaming atmosphere
BRAND: UltraGear's competitive edge and immersive gaming
```

**UltraWide Monitor**:
```
WORKSPACE: Creative professional or productivity powerhouse desk
- Clean, expansive desk setup emphasizing the ultrawide screen real estate
- Creative tools: drawing tablet, color-accurate lighting, dual monitor possibility
- Screen content: timeline editing, multi-window productivity, or creative software
- Premium quality peripherals
LIGHTING: Bright, color-accurate — professional creative environment
BRAND: UltraWide's productivity and creative advantage
```

**UHD 4K/5K Monitor**:
```
WORKSPACE: Professional home office or creative workstation
- Clean, minimal desk setup focusing on display quality
- Screen content: high-resolution photo editing, document work, or video content
- Quality ergonomic accessories
LIGHTING: Balanced, natural — professional accuracy
BRAND: LG's premium display quality for professionals
```

**Ergo Monitor**:
```
WORKSPACE: Ergonomic, health-conscious home office
- Emphasize the flexible stand with various positions (height, tilt, swivel)
- Clean, clutter-free desk made possible by the clamp mount
- Ergonomic accessories: split keyboard, vertical mouse, wrist rest
LIGHTING: Bright, natural — healthy workspace
BRAND: Ergonomic design for comfortable, productive work
```

**Smart Monitor**:
```
WORKSPACE: Versatile home space — work and entertainment hybrid
- Show the monitor in a dual-use context (office by day, entertainment by night)
- Screen content: webOS interface, streaming app, or work documents
- Cozy yet functional setup
LIGHTING: Warm, flexible — adapts to work and leisure
BRAND: Smart Monitor's versatility — work, stream, and browse without a PC
```

---

## People Injection

### Include People
```
PEOPLE:
- Include 1 person at the desk, engaged with the monitor (working, gaming, creating)
- From behind or side angle — showing their interaction with the screen
- Appropriate posture and energy for the context (focused for work, excited for gaming)
- Modern appearance appropriate for {country_name}
```

### Exclude People
```
PEOPLE:
- Do NOT include any people
- An inviting desk setup ready for use — coffee, headphones, keyboard illuminated
- The workspace tells the story of its owner through curated accessories
```
