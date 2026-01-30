export default {
    async fetch(request, env, ctx) {
        // Handle CORS for development and production
        if (request.method === "OPTIONS") {
            return new Response(null, {
                headers: {
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Methods": "POST, OPTIONS",
                    "Access-Control-Allow-Headers": "Content-Type",
                },
            });
        }

        if (request.method !== "POST") {
            return new Response("Method Not Allowed", { status: 405 });
        }

        try {
            const { message } = await request.json();
            const apiKey = env.API_KEY_Roniya;

            if (!apiKey) {
                throw new Error("Missing API_KEY_Roniya environment variable");
            }

            const systemPrompt = `You are the AI assistant for Roniya Aesthetic, a medical-led aesthetic clinic in Oldbury, Birmingham.
    
    BUSINESS INFO:
    - Location: 20 Wolverhampton Road, B68 0LH, Oldbury, Birmingham
    - Contact: 07738 889858
    - Led by: Dr. Mari (Pharmacist & Master Injector, JCCP Member)
    - Languages: English, Persian, Kurdish, Arabic
    - Instagram: @roniya.aesthetic
    - Facebook: Roniya Aesthetic Academy
    
    SERVICES & ESTIMATED PRICING (Always verify current prices):
    1. Lip Fillers: £150-£300 (Subtle enhancement to volume)
    2. Anti-Wrinkle (Botox): £150 (1 area), £200 (2 areas), £250 (3 areas)
    3. Skin Boosters: From £200 (Profhilo, Seventy Hyal)
    4. HydraFacial: £100-£150
    5. Microneedling: £150 per session
    
    AUTOMATION TRIGGERS (Simulated):
    - If user asks about "aftercare" for a specific treatment, provide concise medical advice (e.g., no gym for 24h, no makeup for 12h).
    - If user asks about "pre-treatment", warn about alcohol, blood thinners, and makeup.
    - If user asks to "book", use this EXACT response: "You can book via the form on our website: Book Online Here. Alternatively, call us on 07738 889858."
    
    TONE & STYLE:
    - CONCISE AND DIRECT. Answer ONLY what is asked.
    - No filler, no fluff, no repetitive marketing speeches.
    - Professional and warm, but get straight to the point.
    - Do NOT end every message with "Would you like to book...". Only ask if relevant.
    - Do NOT copy-paste the "About Us" paragraph unless specifically asked.
    
    CONSTRAINTS:
    - Keep responses short (under 3 sentences where possible).
    - If asked for price, give price.
    - If asked for location, give location.
    - Do NOT diagnose medical conditions.
    - If unsure, ask them to book a consultation.
    - Output the list in a compact format. Do not add double line breaks between items.
    
    FORMATTING:
    - Use tight, single-spaced formatting.
    - Do NOT split paragraphs with double line breaks. Use single line breaks if absolutely necessary.
    - Do NOT include trailing newlines or empty spaces at the end of the message.
    - Ensure text ends immediately after the last character so the bubble wraps tightly.
    
    User Query: ${message}`;

            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemma-3-27b-it:generateContent?key=${apiKey}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [{ text: systemPrompt }]
                    }]
                }),
            });

            const data = await response.json();

            if (data.error) {
                throw new Error(data.error.message);
            }

            const aiResponse = data.candidates[0].content.parts[0].text;

            return new Response(JSON.stringify({ response: aiResponse }), {
                headers: {
                    "Content-Type": "application/json",
                    "Access-Control-Allow-Origin": "*",
                },
            });

        } catch (error) {
            return new Response(JSON.stringify({ error: error.message }), {
                status: 500,
                headers: {
                    "Content-Type": "application/json",
                    "Access-Control-Allow-Origin": "*",
                },
            });
        }
    }
};
