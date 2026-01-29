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
    - If user asks to "book", direct them to the booking form on the website or provide the phone number.
    
    TONE:
    - Professional, reassuring, medical, and warm.
    - Emphasize SAFETY (Medical-led, sterile environment).
    - Do NOT diagnose medical conditions.
    - If unsure, ask them to book a consultation.
    
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
