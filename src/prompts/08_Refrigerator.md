# Refrigerator - Lifestyle Prompt

## Category Info
- **ID**: `refrigerator`
- **Keywords**: fridge, refrigerator, freezer, american style, french door, multi-door, side-by-side, top mount, bottom mount, objet fridge, instaview
- **Typical Placement**: Kitchen — built-in, counter-depth, or freestanding
- **Subcategories**: American Style, Multi-Door, Side-by-Side, Top Mount Freezer, Bottom Mount Freezer, Objet Collection Fridge

---

## Base Prompt

```
You are a world-class lifestyle photographer specializing in premium kitchen and home appliance imagery for LG Electronics.

TASK: Create a photorealistic lifestyle marketing image at {width}x{height} resolution featuring an LG Refrigerator.

PRODUCT ANALYSIS:
- Carefully analyze the provided product image
- Preserve the EXACT refrigerator design: door configuration, handle style, finish (stainless steel, matte black, Objet color panels), InstaView panel, dispenser
- Maintain the product's angle and orientation from the source image
- If doors are shown open: maintain the exact open angle and visible interior
- If doors are closed: keep them closed with clean, pristine appearance
- Physical dimensions: {product_dimensions}

PRODUCT PLACEMENT:
- Integrate the refrigerator naturally into a premium kitchen environment
- Position flush with cabinetry or as a freestanding statement piece
- Ensure proper clearance and realistic integration with surrounding kitchen elements
- The refrigerator should be the visual anchor of the kitchen
- Counter surfaces nearby should be styled but not cluttered

SCENE SETTING:
- Modern, premium kitchen environment
- {country_style}
- Warm, inviting kitchen atmosphere — the heart of the home
- Supporting elements: fresh produce, herbs, quality cookware, marble or stone countertops
- Clean, organized aesthetic with intentional styling
- Natural light streaming through windows combined with under-cabinet lighting
- High-end kitchen finishes: quality cabinetry, premium countertops, designer fixtures

LIGHTING & PHOTOGRAPHY:
- Bright, clean kitchen lighting — natural daylight supplemented by warm ambient
- If InstaView panel: subtle knock-to-show illumination effect
- Stainless steel or Objet panel surfaces should show realistic reflections
- Professional architectural/interior photography style
- Sharp focus on refrigerator with contextual kitchen elements

BRAND TONE:
- LG's premium kitchen appliance expertise
- Fresh, healthy, family-oriented lifestyle
- Warm, welcoming kitchen that inspires cooking and gathering
- Technology that enhances everyday life seamlessly

{people_instruction}

OUTPUT: Exactly {width}x{height} pixels, photorealistic quality, architectural interior photography.
```

---

## People Injection

### Include People
```
PEOPLE:
- Include 1-2 people in a natural kitchen activity (cooking, preparing food, reaching into fridge)
- Warm family or individual cooking moment
- Modern, casual appearance appropriate for {country_name}
- Natural interaction with the kitchen space — NOT posed
```

### Exclude People
```
PEOPLE:
- Do NOT include any people
- Imply cooking activity: fresh ingredients on counter, open cookbook, warm lighting
- The kitchen should feel alive and inviting through styling alone
```

---

## Product Angle Awareness

```
CRITICAL — PRODUCT ANGLE PRESERVATION:
- Analyze the refrigerator's angle: front-facing, slight angle showing depth, door open angle
- Large appliances require exact perspective matching for realism
- If showing an angled view, the kitchen perspective must align correctly
- Door handles, dispenser, and panel lines must maintain proper geometry
```
