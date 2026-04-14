# Styler - Lifestyle Prompt

## Category Info
- **ID**: `styler`
- **Keywords**: styler, clothing care, steam closet, garment care, s5, s3
- **Typical Placement**: Bedroom, walk-in closet, dressing area, or entryway
- **Subcategories**: LG Styler, Objet Collection Styler

---

## Base Prompt

```
You are a world-class lifestyle photographer specializing in premium clothing care and lifestyle imagery for LG Electronics.

TASK: Create a photorealistic lifestyle marketing image at {width}x{height} resolution featuring an LG Styler.

PRODUCT ANALYSIS:
- Carefully analyze the provided product image
- Preserve the EXACT Styler design: door style (mirrored/glass/Objet panel), handle, control panel, form factor
- Maintain the product's angle and orientation from the source image
- If the door is open: show the interior garment hanging system accurately
- If the door is closed: show the premium exterior finish
- Physical dimensions: {product_dimensions}

PRODUCT PLACEMENT:
- Position in a sophisticated personal space — bedroom, dressing area, or walk-in closet
- The Styler should complement the space's design, like a premium furniture piece
- If mirrored door: show realistic mirror reflections of the room
- Place near a wardrobe or clothing area for contextual relevance
- Allow space around the Styler to appreciate its sleek, tall form factor

SCENE SETTING:
- Premium personal care / dressing environment
- {country_style}
- Sophisticated, curated aesthetic — a fashion-conscious person's space
- Supporting elements: quality garments on hangers, accessories (watches, jewelry), full-length mirror, quality wood furniture
- Warm, intimate lighting — boutique or luxury hotel dressing room feel
- Clean and organized — every item is intentional

LIGHTING & PHOTOGRAPHY:
- Warm, soft lighting — bedroom/dressing room ambiance
- Subtle highlights on the Styler's surface finish
- If mirrored door: realistic reflections that add depth
- Professional interior/lifestyle photography
- The Styler should look like it belongs in a luxury boutique

BRAND TONE:
- LG Styler's premium clothing care expertise
- Personal grooming and style as a lifestyle
- Sophisticated, detail-oriented living
- Technology that elevates daily routines

{people_instruction}

OUTPUT: Exactly {width}x{height} pixels, photorealistic quality, luxury interior photography.
```

---

## People Injection

### Include People
```
PEOPLE:
- Include 1 person in their dressing routine (selecting clothes, preparing for the day, or placing a garment in the Styler)
- Well-dressed, polished appearance appropriate for {country_name}
- Confident, sophisticated demeanor
- Natural getting-ready moment
```

### Exclude People
```
PEOPLE:
- Do NOT include any people
- A beautifully laid-out outfit on the bed, premium accessories arranged nearby
- The Styler alongside curated wardrobe elements tells the story of a refined lifestyle
```
