/* =====================================================
   CREATORMAGIC AI
   SCRIPT.JS VERSION 6.0
   SHORT OUTPUT EDITION
===================================================== */

const CM_CONFIG = {
    apiURL: "https://creatormagic-ai.kidss1y7s.workers.dev",
    version: "6.0",
    requestTimeout: 120000,
    maxSourceLength: 18000
};

window.currentImagePrompt = "";
window.currentVideoPrompt = "";
window.currentReel = "";
window.currentStory = "";
window.currentSourceStoryboard = "";

window.CREATOR_MAGIC_VERSION = CM_CONFIG.version;


/* =====================================================
   1. SHORT OUTPUT INSTRUCTIONS
===================================================== */

const SHORT_RULES = `
IMPORTANT OUTPUT RULES:
Create concise, professional, high-quality content.
Follow the user's requirements exactly.
Avoid unnecessary introductions and explanations.
Do not repeat the user's instructions.
Do not include reasoning or internal analysis.
Do not include JSON, API metadata or technical details.
Return only the requested final content.
Use clear formatting and avoid repetition.
`;


/* =====================================================
   2. RESPONSE EXTRACTION
===================================================== */

function extractAIText(data, preferredKeys = []) {

    if (data === null || data === undefined) return "";

    if (typeof data === "string") {

        let value = data.trim();

        if (!value) return "";

        value = value.replace(/^```(?:json|text)?\s*/i, "");
        value = value.replace(/\s*```$/i, "");

        try {

            const parsed = JSON.parse(value);

            if (typeof parsed === "object" && parsed !== null) {
                const extracted = extractAIText(parsed, preferredKeys);
                if (extracted) return extracted;
            }

        } catch (error) {}

        return value;
    }

    if (Array.isArray(data)) {

        for (const item of data) {

            const text = extractAIText(item, preferredKeys);

            if (text) return text;

        }

        return "";
    }

    if (typeof data !== "object") return "";

    if (data.success === false) {

        throw new Error(data.error || "AI generation failed.");

    }

    if (Array.isArray(data.choices)) {

        const choice = data.choices[0];

        if (choice) {

            const content = extractAIText(
                choice.message?.content || choice.text,
                preferredKeys
            );

            if (content) return content;

        }

    }

    const ignored = new Set([
        "reasoning_content",
        "reasoning",
        "usage",
        "model",
        "id",
        "object",
        "created",
        "metadata"
    ]);

    const keys = [
        ...preferredKeys,
        "prompt",
        "story",
        "analysis",
        "result",
        "output",
        "text",
        "content",
        "data"
    ];

    for (const key of keys) {

        if (ignored.has(key)) continue;

        if (data[key] === undefined || data[key] === null) continue;

        const result = extractAIText(data[key], preferredKeys);

        if (result) return result;

    }

    return "";
}


/* =====================================================
   3. API CONNECTION
===================================================== */

async function callCreatorMagicAPI(endpoint, data) {

    const controller = new AbortController();

    const timeout = setTimeout(
        () => controller.abort(),
        CM_CONFIG.requestTimeout
    );

    try {

        const response = await fetch(
            CM_CONFIG.apiURL.replace(/\/+$/, "") + endpoint,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json",
                    ...(localStorage.getItem("cm_auth_token") ? {"Authorization": "Bearer " + localStorage.getItem("cm_auth_token")} : {})
                },
                body: JSON.stringify(data),
                signal: controller.signal
            }
        );

        const responseText = await response.text();

        let result;

        try {

            result = responseText ? JSON.parse(responseText) : {};

        } catch (error) {

            throw new Error("Invalid server response.");

        }

        if (!response.ok || result.success === false) {

            throw new Error(
                result.error ||
                result.message ||
                "Generation failed. Please try again."
            );

        }

        return result;

    } catch (error) {

        console.error("CreatorMagic API:", error);

        if (error.name === "AbortError") {
            throw new Error("Request timed out. Please try again.");
        }

        if (error instanceof TypeError) {
            throw new Error("Connection failed. Check your internet.");
        }

        throw error;

    } finally {

        clearTimeout(timeout);

    }

}


/* =====================================================
   4. DESIGN
===================================================== */

function inputStyle() {

    return `
        width:100%;
        box-sizing:border-box;
        padding:13px;
        margin:8px 0 15px;
        border:1px solid #444;
        border-radius:10px;
        background:#17172b;
        color:white;
        font-size:15px;
        outline:none;
    `;

}

function buttonStyle() {

    return `
        padding:13px 20px;
        border:none;
        border-radius:10px;
        background:linear-gradient(135deg,#8b5cf6,#ec4899);
        color:white;
        font-size:15px;
        font-weight:bold;
        cursor:pointer;
        margin:6px 5px 6px 0;
    `;

}

function outputStyle() {

    return `
        width:100%;
        min-height:120px;
        box-sizing:border-box;
        padding:15px;
        margin-top:12px;
        background:#17172b;
        color:white;
        border:1px solid #444;
        border-radius:10px;
        line-height:1.7;
        white-space:pre-wrap;
        overflow-wrap:anywhere;
    `;

}

function labelStyle() {

    return `
        display:block;
        color:#e9d5ff;
        font-weight:bold;
        margin-top:10px;
    `;

}


/* =====================================================
   5. COMMON FUNCTIONS
===================================================== */

function escapeHTML(value) {

    return String(value).replace(/[&<>"']/g, character => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;"
    })[character]);

}

function getValue(id) {

    const element = document.getElementById(id);

    return element ? element.value.trim() : "";

}

function showOutput(id, content) {

    const element = document.getElementById(id);

    if (element) element.textContent = String(content ?? "");

}

function setLoading(button, loading) {

    if (!button) return;

    if (loading) {

        button.dataset.originalText = button.innerHTML;
        button.innerHTML = "⏳ Creating...";
        button.disabled = true;
        button.style.opacity = "0.6";

    } else {

        button.innerHTML = button.dataset.originalText || "Generate";
        button.disabled = false;
        button.style.opacity = "1";

    }

}


/* =====================================================
   6. COPY AND DOWNLOAD
===================================================== */

async function copyText(text) {

    if (!text) {
        alert("Generate content first.");
        return;
    }

    try {

        if (navigator.clipboard && window.isSecureContext) {

            await navigator.clipboard.writeText(text);

        } else {

            fallbackCopy(text);
            return;

        }

        alert("Copied successfully! 📋");

    } catch (error) {

        fallbackCopy(text);

    }

}

function fallbackCopy(text) {

    const textarea = document.createElement("textarea");

    textarea.value = text;
    textarea.style.position = "fixed";
    textarea.style.left = "-9999px";

    document.body.appendChild(textarea);

    textarea.select();

    try {

        document.execCommand("copy");
        alert("Copied successfully! 📋");

    } catch (error) {

        alert("Please copy manually.");

    }

    textarea.remove();

}

function downloadText(filename, content) {

    if (!content) {
        alert("Generate content first.");
        return;
    }

    const blob = new Blob(
        [content],
        { type: "text/plain;charset=utf-8" }
    );

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = url;
    link.download = filename;

    document.body.appendChild(link);

    link.click();
    link.remove();

    setTimeout(() => URL.revokeObjectURL(url), 1000);

}


/* =====================================================
   7. MODAL
===================================================== */

function closeExistingModal() {

    const modal = document.getElementById("creatorMagicModal");

    if (modal) modal.remove();

    document.body.style.overflow = "";

}

function createModal(title, subtitle, content) {

    closeExistingModal();

    const modal = document.createElement("div");

    modal.id = "creatorMagicModal";

    modal.style.cssText = `
        position:fixed;
        inset:0;
        z-index:99999;
        background:rgba(0,0,0,.88);
        display:flex;
        justify-content:center;
        align-items:center;
        padding:12px;
        overflow-y:auto;
        box-sizing:border-box;
    `;

    modal.innerHTML = `

        <div style="
            width:100%;
            max-width:750px;
            max-height:94vh;
            overflow-y:auto;
            box-sizing:border-box;
            background:#101024;
            color:white;
            padding:22px;
            border-radius:18px;
            border:1px solid #7c3aed;
        ">

            <div style="
                display:flex;
                justify-content:space-between;
                align-items:center;
                gap:10px;
            ">

                <h2 style="color:#c4b5fd;margin:0;">
                    ${escapeHTML(title)}
                </h2>

                <button onclick="closeTool()" style="
                    background:#ef4444;
                    color:white;
                    border:none;
                    border-radius:8px;
                    padding:9px 14px;
                    cursor:pointer;
                ">✕</button>

            </div>

            <p style="color:#cbd5e1;margin:12px 0 20px;">
                ${escapeHTML(subtitle)}
            </p>

            ${content}

        </div>

    `;

    modal.addEventListener("click", event => {

        if (event.target === modal) closeTool();

    });

    document.body.style.overflow = "hidden";

    document.body.appendChild(modal);

}

function closeTool() {

    closeExistingModal();

}


/* =====================================================
   8. STUDIO NAVIGATION
===================================================== */

function openTool(tool) {

    const studios = {
        image: openImageStudio,
        video: openVideoStudio,
        reel: openReelStudio,
        story: openStoryStudio
    };

    if (tool === "source") {

        alert("Source to Video Studio is temporarily disabled.");
        return;

    }

    if (studios[tool]) {

        studios[tool]();

    } else {

        alert("Studio not found.");

    }

}


/* =====================================================
   9. AI IMAGE STUDIO
===================================================== */

function openImageStudio() {

    const content = `

        <label style="${labelStyle()}">Describe Your Image</label>

        <textarea id="imageIdea"
            placeholder="Describe your image idea..."
            style="${inputStyle()}height:110px;"></textarea>

        <label style="${labelStyle()}">Art Style</label>

        <select id="imageStyle" style="${inputStyle()}">
            <option value="Premium 3D animation">Pixar Inspired 3D</option>
            <option value="Cinematic 3D animation">Cinematic 3D</option>
            <option value="Photorealistic photography">Realistic Photography</option>
            <option value="Anime illustration">Anime</option>
            <option value="Children's storybook illustration">Children's Illustration</option>
            <option value="Fantasy digital artwork">Fantasy Art</option>
            <option value="Watercolour painting">Watercolour</option>
        </select>

        <label style="${labelStyle()}">Lighting</label>

        <select id="imageLighting" style="${inputStyle()}">
            <option value="Cinematic lighting">Cinematic</option>
            <option value="Golden hour sunlight">Golden Hour</option>
            <option value="Natural daylight">Natural Daylight</option>
            <option value="Magical lighting">Magical</option>
            <option value="Professional studio lighting">Studio</option>
        </select>

        <label style="${labelStyle()}">Image Ratio</label>

        <select id="imageRatio" style="${inputStyle()}">
            <option value="1:1">Square</option>
            <option value="9:16">Portrait</option>
            <option value="16:9">Landscape</option>
        </select>

        <label style="${labelStyle()}">Quality</label>

        <select id="imageQuality" style="${inputStyle()}">
            <option value="Ultra detailed professional quality">Ultra Detailed</option>
            <option value="High quality realistic textures">High Detail</option>
            <option value="Professional commercial quality">Professional</option>
        </select>

        <button id="imageGenerateButton"
            onclick="generateImagePrompt()"
            style="${buttonStyle()}">
            ✨ Generate Image Prompt
        </button>

        <div id="imageResult" style="${outputStyle()}">
            Your image prompt will appear here.
        </div>

        <button onclick="copyImagePrompt()" style="${buttonStyle()}">📋 Copy</button>

        <button onclick="downloadImagePrompt()" style="${buttonStyle()}">⬇️ Download</button>

        <p style="color:#c4b5fd;font-size:12px;">
            Prompt generation only. Actual image generation is disabled.
        </p>

    `;

    createModal("✨ AI Image Studio", "Create professional image prompts.", content);

}

async function generateImagePrompt() {

    const idea = getValue("imageIdea");

    if (!idea) {
        alert("Describe your image first.");
        return;
    }

    const button = document.getElementById("imageGenerateButton");

    if (button.disabled) return;

    setLoading(button, true);

    showOutput("imageResult", "✨ Creating your image prompt...");

    try {

        const result = await callCreatorMagicAPI("/api/image", {

            prompt: SHORT_RULES + "\nCreate one concise professional image-generation prompt. Preserve important visual details. Idea: " + idea,

            idea: idea,

            style: getValue("imageStyle"),
            lighting: getValue("imageLighting"),
            ratio: getValue("imageRatio"),
            quality: getValue("imageQuality")

        });

        const prompt = extractAIText(result, ["prompt", "result", "output", "text"]);

        if (!prompt) throw new Error("Empty image prompt.");

        window.currentImagePrompt = prompt;

        showOutput("imageResult", prompt);

    } catch (error) {

        showOutput("imageResult", "Error: " + error.message);
        alert(error.message);

    } finally {

        setLoading(button, false);

    }

}

function copyImagePrompt() {
    copyText(window.currentImagePrompt);
}

function downloadImagePrompt() {
    downloadText("CreatorMagic-Image-Prompt.txt", window.currentImagePrompt);
}


/* =====================================================
   10. AI VIDEO STUDIO
===================================================== */

function openVideoStudio() {

    const content = `

        <label style="${labelStyle()}">Describe Your Video</label>

        <textarea id="videoIdea"
            placeholder="Describe your video idea..."
            style="${inputStyle()}height:110px;"></textarea>

        <label style="${labelStyle()}">Video Style</label>

        <select id="videoStyle" style="${inputStyle()}">
            <option value="Premium cinematic 3D cartoon animation">Cinematic 3D Cartoon</option>
            <option value="Pixar-inspired 3D animation">Pixar Inspired</option>
            <option value="Photorealistic cinematic video">Realistic</option>
            <option value="Fantasy animation">Fantasy</option>
            <option value="Professional anime animation">Anime</option>
            <option value="Children's animation">Children's Animation</option>
        </select>

        <label style="${labelStyle()}">Duration</label>

        <select id="videoDuration" style="${inputStyle()}">
            <option value="5 seconds">5 Seconds</option>
            <option value="10 seconds">10 Seconds</option>
            <option value="15 seconds">15 Seconds</option>
            <option value="20 seconds">20 Seconds</option>
            <option value="30 seconds">30 Seconds</option>
            <option value="60 seconds">60 Seconds</option>
        </select>

        <label style="${labelStyle()}">Camera Movement</label>

        <select id="videoCamera" style="${inputStyle()}">
            <option value="Smooth tracking shot">Tracking Shot</option>
            <option value="Slow zoom in">Zoom In</option>
            <option value="Smooth zoom out">Zoom Out</option>
            <option value="Aerial drone movement">Drone</option>
            <option value="360 degree camera rotation">360 Rotation</option>
            <option value="Dynamic camera movement">Dynamic</option>
            <option value="Slow cinematic pan">Cinematic Pan</option>
        </select>

        <label style="${labelStyle()}">Animation</label>

        <select id="videoAnimation" style="${inputStyle()}">
            <option value="Smooth natural character movements">Smooth Animation</option>
            <option value="Detailed facial expressions">Facial Expressions</option>
            <option value="Professional 3D animation">3D Animation</option>
            <option value="Natural environmental animation">Environmental</option>
        </select>

        <button id="videoGenerateButton"
            onclick="generateVideoPrompt()"
            style="${buttonStyle()}">
            🎬 Generate Video Prompt
        </button>

        <div id="generatedVideo" style="${outputStyle()}">
            Your video prompt will appear here.
        </div>

        <button onclick="copyVideoPrompt()" style="${buttonStyle()}">📋 Copy</button>

        <button onclick="downloadVideoPrompt()" style="${buttonStyle()}">⬇️ Download</button>

    `;

    createModal("🎬 AI Video Studio", "Create cinematic video prompts.", content);

}

async function generateVideoPrompt() {

    const idea = getValue("videoIdea");

    if (!idea) {
        alert("Enter your video idea.");
        return;
    }

    const button = document.getElementById("videoGenerateButton");

    if (button.disabled) return;

    setLoading(button, true);

    showOutput("generatedVideo", "🎬 Creating your video prompt...");

    try {

        const result = await callCreatorMagicAPI("/api/video", {

            prompt: SHORT_RULES + "\nCreate one concise cinematic video-generation prompt. Include subject action, environment, camera movement and animation. Avoid repetition. Idea: " + idea,

            style: getValue("videoStyle"),
            duration: getValue("videoDuration"),
            camera: getValue("videoCamera"),
            animation: getValue("videoAnimation"),
            quality: "Professional cinematic quality"

        });

        const prompt = extractAIText(result, ["prompt", "result", "output", "text"]);

        if (!prompt) throw new Error("Empty video prompt.");

        window.currentVideoPrompt = prompt;

        showOutput("generatedVideo", prompt);

    } catch (error) {

        showOutput("generatedVideo", "Error: " + error.message);
        alert(error.message);

    } finally {

        setLoading(button, false);

    }

}

function copyVideoPrompt() {
    copyText(window.currentVideoPrompt);
}

function downloadVideoPrompt() {
    downloadText("CreatorMagic-Video-Prompt.txt", window.currentVideoPrompt);
}


/* =====================================================
   11. INSTAGRAM REEL STUDIO
===================================================== */

function openReelStudio() {

    const content = `

        <label style="${labelStyle()}">Reel Topic</label>

        <textarea id="reelTopic"
            placeholder="Enter your reel topic..."
            style="${inputStyle()}height:100px;"></textarea>

        <label style="${labelStyle()}">Category</label>

        <select id="reelCategory" style="${inputStyle()}">
            <option value="Educational">Educational</option>
            <option value="Kids Learning">Kids Learning</option>
            <option value="Motivational">Motivational</option>
            <option value="Devotional">Devotional</option>
            <option value="Entertainment">Entertainment</option>
            <option value="Funny">Funny</option>
            <option value="Storytelling">Storytelling</option>
            <option value="Business">Business</option>
        </select>

        <label style="${labelStyle()}">Language</label>

        <select id="reelLanguage" style="${inputStyle()}">
            <option value="English">English</option>
            <option value="Hindi">Hindi</option>
            <option value="Marathi">Marathi</option>
        </select>

        <label style="${labelStyle()}">Duration</label>

        <select id="reelDuration" style="${inputStyle()}">
            <option value="15 seconds">15 Seconds</option>
            <option value="30 seconds">30 Seconds</option>
            <option value="45 seconds">45 Seconds</option>
            <option value="60 seconds">60 Seconds</option>
        </select>

        <button id="reelGenerateButton"
            onclick="generateReel()"
            style="${buttonStyle()}">
            🚀 Generate Reel
        </button>

        <div id="generatedReel" style="${outputStyle()}">
            Your reel content will appear here.
        </div>

        <button onclick="copyReel()" style="${buttonStyle()}">📋 Copy</button>

        <button onclick="downloadReel()" style="${buttonStyle()}">⬇️ Download</button>

    `;

    createModal("📱 Instagram Reel Studio", "Create engaging social media reels.", content);

}

async function generateReel() {

    const topic = getValue("reelTopic");

    if (!topic) {
        alert("Enter your reel topic.");
        return;
    }

    const button = document.getElementById("reelGenerateButton");

    if (button.disabled) return;

    setLoading(button, true);

    showOutput("generatedReel", "🚀 Creating your reel...");

    try {

        const result = await callCreatorMagicAPI("/api/reel", {

            topic: topic + "\n\n" + SHORT_RULES +
                "\nCreate a concise reel package: one hook, short script, caption and 5 relevant hashtags. Respect selected duration.",

            niche: getValue("reelCategory"),
            language: getValue("reelLanguage"),
            duration: getValue("reelDuration")

        });

        const reel = extractAIText(result, ["result", "story", "prompt", "output", "text"]);

        if (!reel) throw new Error("Empty reel content.");

        window.currentReel = reel;

        showOutput("generatedReel", reel);

    } catch (error) {

        showOutput("generatedReel", "Error: " + error.message);
        alert(error.message);

    } finally {

        setLoading(button, false);

    }

}

function copyReel() {
    copyText(window.currentReel);
}

function downloadReel() {
    downloadText("CreatorMagic-Instagram-Reel.txt", window.currentReel);
}


/* =====================================================
   12. AI STORY STUDIO
===================================================== */

function openStoryStudio() {

    const content = `

        <label style="${labelStyle()}">Story Idea</label>

        <textarea id="storyIdea"
            placeholder="Describe your story idea..."
            style="${inputStyle()}height:100px;"></textarea>

        <label style="${labelStyle()}">Story Category</label>

        <select id="storyCategory" style="${inputStyle()}">
            <option value="Moral Story">Moral Story</option>
            <option value="Bedtime Story">Bedtime Story</option>
            <option value="Adventure Story">Adventure Story</option>
            <option value="Animal Story">Animal Story</option>
            <option value="Educational Story">Educational Story</option>
            <option value="Fantasy Story">Fantasy Story</option>
            <option value="Devotional Story">Devotional Story</option>
        </select>

        <label style="${labelStyle()}">Language</label>

        <select id="storyLanguage" style="${inputStyle()}">
            <option value="English">English</option>
            <option value="Hindi">Hindi</option>
            <option value="Marathi">Marathi</option>
        </select>

        <label style="${labelStyle()}">Art Style</label>

        <select id="storyStyle" style="${inputStyle()}">
            <option value="Pixar-inspired 3D animation">Pixar Inspired 3D</option>
            <option value="Cinematic 3D cartoon">Cinematic 3D</option>
            <option value="Watercolour illustration">Watercolour</option>
            <option value="Fantasy digital artwork">Fantasy</option>
            <option value="Children's storybook illustration">Children's Illustration</option>
        </select>

        <button id="storyGenerateButton"
            onclick="generateStory()"
            style="${buttonStyle()}">
            📖 Generate AI Story
        </button>

        <div id="generatedStory" style="${outputStyle()}">
            Your story will appear here.
        </div>

        <button onclick="copyStory()" style="${buttonStyle()}">📋 Copy</button>

        <button onclick="downloadStory()" style="${buttonStyle()}">⬇️ Download</button>

    `;

    createModal("📚 AI Story Studio", "Create original stories.", content);

}

async function generateStory() {

    const idea = getValue("storyIdea");

    if (!idea) {
        alert("Enter your story idea.");
        return;
    }

    const button = document.getElementById("storyGenerateButton");

    if (button.disabled) return;

    setLoading(button, true);

    showOutput("generatedStory", "📖 Creating your story...");

    try {

        const result = await callCreatorMagicAPI("/api/story", {

            topic: idea + "\n\n" + SHORT_RULES +
                "\nCreate a short, complete and engaging children's story. Use simple language, original characters and a clear ending. Avoid unnecessary explanations.",

            prompt: idea,

            characters: "Create suitable original characters",
            age: "Children",
            language: getValue("storyLanguage"),
            category: getValue("storyCategory"),
            style: getValue("storyStyle")

        });

        const story = extractAIText(result, ["story", "result", "prompt", "output", "text"]);

        if (!story) throw new Error("Empty story content.");

        window.currentStory = story;

        showOutput("generatedStory", story);

    } catch (error) {

        showOutput("generatedStory", "Error: " + error.message);
        alert(error.message);

    } finally {

        setLoading(button, false);

    }

}

function copyStory() {
    copyText(window.currentStory);
}

function downloadStory() {
    downloadText("CreatorMagic-AI-Story.txt", window.currentStory);
}


/* =====================================================
   13. SOURCE TO VIDEO
   ORIGINAL FUNCTIONALITY PRESERVED
   INTERFACE HIDDEN
===================================================== */

function addSourceTextInput() {

    const sourceURL = document.getElementById("sourceURL");

    if (!sourceURL) return;

    if (document.getElementById("sourceContent")) return;

    const container = sourceURL.parentElement;

    const wrapper = document.createElement("div");

    wrapper.innerHTML = `

        <label style="${labelStyle()}">
            Source Transcript / Article Content
        </label>

        <textarea id="sourceContent"
            placeholder="Paste transcript or article..."
            style="${inputStyle()}height:180px;"></textarea>

    `;

    const result = document.getElementById("sourceResult");

    if (result) {
        container.insertBefore(wrapper, result);
    } else {
        container.appendChild(wrapper);
    }

}

function openSourceStudio() {

    const section = document.getElementById("sourceStudio");

    if (section) section.style.display = "none";

    alert("Source to Video Studio is temporarily disabled.");

}

function validateSourceURL(url) {

    try {

        const parsed = new URL(url);

        return ["https:", "http:"].includes(parsed.protocol);

    } catch (error) {

        return false;

    }

}

async function analyseSource() {

    addSourceTextInput();

    const url = getValue("sourceURL");
    const sourceText = getValue("sourceContent");

    const videoType = getValue("sourceVideoType");
    const language = getValue("sourceLanguage");
    const duration = getValue("sourceDuration");

    if (!url && !sourceText) {
        alert("Please enter source content.");
        return;
    }

    if (url && !validateSourceURL(url)) {
        alert("Enter a valid URL.");
        return;
    }

    if (!sourceText || sourceText.length < 100) {
        alert("Paste at least 100 characters of source text.");
        return;
    }

    if (sourceText.length > CM_CONFIG.maxSourceLength) {
        alert("Limit source content to 18,000 characters.");
        return;
    }

    const result = document.getElementById("sourceResult");

    if (!result) return;

    result.textContent = "Analysing source...";

    try {

        const aiResult = await callCreatorMagicAPI("/api/source-to-video", {

            transcript: sourceText,
            videoType: videoType,
            language: language,
            duration: duration

        });

        window.currentSourceStoryboard = extractAIText(
            aiResult,
            ["analysis", "result", "output", "text"]
        );

        if (!window.currentSourceStoryboard) {
            throw new Error("Empty source analysis.");
        }

        result.textContent = window.currentSourceStoryboard;

    } catch (error) {

        result.textContent = "Analysis Error: " + error.message;

    }

}

function generateSourceVideo() {
    analyseSource();
}

function copySourceVideo() {
    copyText(window.currentSourceStoryboard);
}


/* =====================================================
   14. KEYBOARD SUPPORT
===================================================== */

document.addEventListener("keydown", event => {

    if (event.key === "Escape") closeTool();

});


/* =====================================================
   15. STARTUP
===================================================== */

function initializeCreatorMagic() {

    const sourceSection = document.getElementById("sourceStudio");

    if (sourceSection) sourceSection.style.display = "none";

    console.log("--------------------------------");
    console.log("CREATORMAGIC AI LOADED");
    console.log("Version: " + CM_CONFIG.version);
    console.log("API: " + CM_CONFIG.apiURL);
    console.log("Image Studio: READY");
    console.log("Video Studio: READY");
    console.log("Reel Studio: READY");
    console.log("Story Studio: READY");
    console.log("Source to Video: HIDDEN");
    console.log("Short Output Edition: READY");
    console.log("--------------------------------");

}

if (document.readyState === "loading") {

    document.addEventListener(
        "DOMContentLoaded",
        initializeCreatorMagic
    );

} else {

    initializeCreatorMagic();

}


/* =====================================================
   END CREATORMAGIC AI VERSION 6.0
===================================================== */

/* =====================================================
   CREATOR MAGIC ACCOUNT + CREDITS + MANUAL UPI PAYMENTS
   Compatible with deployed CreatorMagic AI Worker 4.1
   Uses the existing cm_auth_token login session.
===================================================== */
(function CreatorMagicAccountPaymentV41() {
    const API = CM_CONFIG.apiURL.replace(/\/+$/, "");
    const tokenKey = "cm_auth_token";
    const ADMIN_EMAIL = "kidss1y7s@gmail.com";

    let current = null;
    let selectedPackage = null;
    let paymentUpiId = "tejashi@ybl";
    let adminSecret = ""; // memory only; never stored in localStorage or source code

    const css = `
      #cm-account{position:fixed;right:14px;bottom:14px;z-index:99999;font-family:Arial,sans-serif;color:#fff}
      #cm-account button{border:0;border-radius:9px;padding:10px 13px;background:linear-gradient(135deg,#8b5cf6,#ec4899);color:#fff;font-weight:700;cursor:pointer;margin:4px}
      #cm-account button:disabled{opacity:.55;cursor:not-allowed}
      #cm-account .cm-fab{border-radius:30px;padding:13px 17px;box-shadow:0 5px 24px #0005}
      #cm-panel{display:none;width:min(390px,calc(100vw - 28px));max-height:82vh;overflow:auto;background:#17172b;border:1px solid #554477;border-radius:16px;padding:16px;margin-bottom:10px;box-shadow:0 12px 40px #0008;box-sizing:border-box}
      #cm-panel *{box-sizing:border-box}
      #cm-panel input,#cm-panel select,#cm-panel textarea{width:100%;padding:11px;border-radius:8px;border:1px solid #555;background:#101020;color:#fff;margin:5px 0 10px}
      #cm-panel label{display:block;font-size:13px;color:#ddd;margin-top:8px}
      #cm-panel .cm-muted{color:#c5bfd7;font-size:13px;line-height:1.5}
      #cm-panel .cm-card{background:#24213a;border:1px solid #393252;border-radius:11px;padding:12px;margin:9px 0}
      #cm-panel .cm-row{display:flex;gap:8px;align-items:center;justify-content:space-between;flex-wrap:wrap}
      #cm-panel .cm-pill{display:inline-block;padding:4px 8px;border-radius:20px;background:#37304f;font-size:11px}
      #cm-panel .cm-status-pending{color:#fbbf24}.cm-status-approved{color:#4ade80}.cm-status-rejected{color:#f87171}
      #cm-panel a{color:#d7b8ff}
      #cm-panel .cm-wide{width:100%;margin:7px 0}
      #cm-panel .cm-secondary{background:#39334e}
      #cm-panel .cm-small{font-size:12px}
      #cm-panel .cm-success{color:#86efac}
      #cm-panel .cm-error{color:#fca5a5}
    `;

    const root = document.createElement("div");
    root.id = "cm-account";
    root.innerHTML = `
      <style>${css}</style>
      <section id="cm-panel" aria-live="polite">
        <div class="cm-row">
          <b>✦ CreatorMagic AI Account</b>
          <button id="cm-close" class="cm-secondary" aria-label="Close">✕</button>
        </div>
        <div id="cm-content"></div>
      </section>
      <button class="cm-fab" id="cm-open">Login / Credits</button>
    `;
    document.body.appendChild(root);

    const panel = root.querySelector("#cm-panel");
    const content = root.querySelector("#cm-content");
    const fab = root.querySelector("#cm-open");

    const esc = value => String(value ?? "").replace(/[&<>"']/g, ch => ({
        "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
    }[ch]));

    async function api(path, options = {}) {
        const method = options.method || "GET";
        const headers = { "Accept": "application/json" };
        const token = localStorage.getItem(tokenKey);
        if (token) headers.Authorization = "Bearer " + token;
        if (options.body !== undefined) headers["Content-Type"] = "application/json";
        if (options.adminSecret) headers["X-Admin-Secret"] = options.adminSecret;

        const response = await fetch(API + path, {
            method,
            headers,
            ...(options.body !== undefined ? { body: JSON.stringify(options.body) } : {})
        });
        const data = await response.json().catch(() => ({ success: false, error: "Invalid server response." }));
        if (!response.ok || data.success === false) {
            throw new Error(data.error || data.message || `Request failed (${response.status}).`);
        }
        return data;
    }

    function show(html) {
        content.innerHTML = html;
        panel.style.display = "block";
    }

    function statusClass(status) {
        const value = String(status || "pending").toLowerCase();
        return value === "approved" ? "cm-status-approved" : value === "rejected" ? "cm-status-rejected" : "cm-status-pending";
    }

    function statusLabel(status) {
        const value = String(status || "pending").toLowerCase();
        return value.charAt(0).toUpperCase() + value.slice(1);
    }

    function loginView() {
        show(`
          <p class="cm-muted">Sign in with your email. We will send a one-time verification code.</p>
          <label>Email address</label>
          <input id="cm-email" type="email" autocomplete="email" placeholder="you@example.com">
          <button id="cm-send" class="cm-wide">Send OTP</button>
          <div id="cm-otp-area"></div>
          <p class="cm-muted">New accounts receive 5 free credits.</p>
        `);

        content.querySelector("#cm-send").onclick = async () => {
            const email = content.querySelector("#cm-email").value.trim();
            if (!email) return alert("Please enter your email address.");
            const sendButton = content.querySelector("#cm-send");
            sendButton.disabled = true;
            try {
                await api("/api/auth/request-otp", { method: "POST", body: { email } });
                content.querySelector("#cm-otp-area").innerHTML = `
                  <label>6-digit OTP</label>
                  <input id="cm-otp" inputmode="numeric" maxlength="6" autocomplete="one-time-code" placeholder="Enter OTP">
                  <button id="cm-verify" class="cm-wide">Verify & Login</button>
                `;
                content.querySelector("#cm-verify").onclick = async () => {
                    try {
                        const otp = content.querySelector("#cm-otp").value.trim();
                        const data = await api("/api/auth/verify-otp", { method: "POST", body: { email, otp } });
                        localStorage.setItem(tokenKey, data.token);
                        current = data.customer;
                        accountView();
                    } catch (error) { alert(error.message); }
                };
            } catch (error) {
                alert(error.message);
            } finally {
                sendButton.disabled = false;
            }
        };
    }

    async function refreshCustomer() {
        const data = await api("/api/auth/me");
        current = data.customer;
        fab.textContent = `${Number(current.credits) || 0} Credits`;
        return current;
    }

    async function accountView() {
        try {
            await refreshCustomer();
        } catch (error) {
            localStorage.removeItem(tokenKey);
            current = null;
            loginView();
            return;
        }

        const isAdminEmail = String(current.email || "").toLowerCase() === ADMIN_EMAIL;
        show(`
          <div class="cm-card">
            <b>${esc(current.email)}</b>
            <p>Available credits: <strong>${Number(current.credits) || 0}</strong></p>
            <span class="cm-muted">Account: ${esc(current.role || "customer")}</span>
          </div>
          <button id="cm-buy" class="cm-wide">＋ Buy Credits</button>
          <button id="cm-history" class="cm-wide cm-secondary">Payment History</button>
          ${isAdminEmail ? '<button id="cm-admin" class="cm-wide cm-secondary">Admin Payment Review</button>' : ""}
          <button id="cm-refresh" class="cm-wide cm-secondary">Refresh Account</button>
          <button id="cm-logout" class="cm-wide cm-secondary">Logout</button>
        `);

        content.querySelector("#cm-buy").onclick = packagesView;
        content.querySelector("#cm-history").onclick = paymentHistoryView;
        content.querySelector("#cm-refresh").onclick = accountView;
        content.querySelector("#cm-logout").onclick = async () => {
            try { await api("/api/auth/logout", { method: "POST", body: {} }); } catch (_) {}
            localStorage.removeItem(tokenKey);
            current = null;
            adminSecret = "";
            fab.textContent = "Login / Credits";
            loginView();
        };
        const adminButton = content.querySelector("#cm-admin");
        if (adminButton) adminButton.onclick = adminLoginView;
    }

    async function packagesView() {
        show(`<h3>Choose a credit package</h3><p class="cm-muted">Select a package. Pay using UPI, then submit your UTR for verification.</p><div id="cm-packages">Loading packages...</div><button id="cm-back" class="cm-wide cm-secondary">Back</button>`);
        content.querySelector("#cm-back").onclick = accountView;
        try {
            const data = await api("/api/payments/packages");
            const packages = Array.isArray(data.packages) ? data.packages : [];
            paymentUpiId = String(data.upiId || paymentUpiId);
            if (!packages.length) throw new Error("No payment packages are currently available.");
            content.querySelector("#cm-packages").innerHTML = packages.map(pkg => `
              <div class="cm-card">
                <div class="cm-row"><b>${esc(pkg.name)}</b><span class="cm-pill">${Number(pkg.credits)} credits</span></div>
                <h2 style="margin:8px 0">₹${Number(pkg.amount).toLocaleString("en-IN")}</h2>
                <button class="cm-wide" data-package="${esc(pkg.id)}">Choose ${esc(pkg.name)}</button>
              </div>
            `).join("");
            content.querySelectorAll("[data-package]").forEach(button => {
                button.onclick = () => paymentInstructions(packages.find(p => p.id === button.dataset.package));
            });
        } catch (error) {
            content.querySelector("#cm-packages").innerHTML = `<p class="cm-error">${esc(error.message)}</p>`;
        }
    }

    function paymentInstructions(pkg) {
        if (!pkg) return;
        selectedPackage = pkg;
        const upiId = paymentUpiId;
        const amount = Number(pkg.amount).toFixed(2);
        const note = `CreatorMagic ${pkg.name}`;
        const upiLink = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent("CreatorMagic AI")}&am=${encodeURIComponent(amount)}&cu=INR&tn=${encodeURIComponent(note)}`;

        show(`
          <h3>Complete UPI Payment</h3>
          <div class="cm-card">
            <p class="cm-muted">Selected package</p>
            <div class="cm-row"><b>${esc(pkg.name)}</b><b>${Number(pkg.credits)} credits</b></div>
            <h2>₹${Number(pkg.amount).toLocaleString("en-IN")}</h2>
            <p class="cm-muted">Pay to this UPI ID</p>
            <div class="cm-row"><b id="cm-upi-id">${upiId}</b><button id="cm-copy-upi" class="cm-secondary">Copy UPI ID</button></div>
            <a class="cm-pay-link" href="${esc(upiLink)}">Open UPI app to pay ₹${Number(pkg.amount).toLocaleString("en-IN")}</a>
          </div>
          <p class="cm-muted">1. Pay the exact amount using any UPI app.<br>2. After successful payment, copy the UPI transaction ID / UTR from your payment app.<br>3. Enter the UTR below and submit it.</p>
          <label>UPI Transaction ID / UTR</label>
          <input id="cm-utr" maxlength="35" autocomplete="off" placeholder="Enter 6–35 character UTR">
          <button id="cm-submit-utr" class="cm-wide">Submit Payment for Verification</button>
          <button id="cm-back" class="cm-wide cm-secondary">Back to Packages</button>
          <p class="cm-muted cm-small">Your payment will remain Pending until the admin verifies the transaction. Do not submit a UTR before completing payment.</p>
        `);

        content.querySelector("#cm-copy-upi").onclick = async () => {
            try {
                await navigator.clipboard.writeText(upiId);
                alert("UPI ID copied.");
            } catch (_) {
                alert("Please copy this UPI ID manually: " + upiId);
            }
        };
        content.querySelector("#cm-back").onclick = packagesView;
        content.querySelector("#cm-submit-utr").onclick = async () => {
            const upiTransactionId = content.querySelector("#cm-utr").value.trim().replace(/\s+/g, "").toUpperCase();
            if (!/^[A-Z0-9-]{6,35}$/.test(upiTransactionId)) {
                alert("Enter a valid UPI transaction ID / UTR (6 to 35 letters or numbers).");
                return;
            }
            const button = content.querySelector("#cm-submit-utr");
            button.disabled = true;
            try {
                const result = await api("/api/payments/upi/submit", {
                    method: "POST",
                    body: { packageId: pkg.id, upiTransactionId }
                });
                show(`
                  <div class="cm-card">
                    <h3 class="cm-success">✓ Payment details submitted</h3>
                    <p>${esc(result.message || "Your payment is awaiting admin verification.")}</p>
                    <p>Package: <b>${esc(result.payment?.package || pkg.name)}</b></p>
                    <p>Amount: <b>₹${Number(result.payment?.amount ?? pkg.amount).toLocaleString("en-IN")}</b></p>
                    <p>Credits after approval: <b>${Number(result.payment?.credits ?? pkg.credits)}</b></p>
                    <p>UTR: <b>${esc(result.payment?.upiTransactionId || upiTransactionId)}</b></p>
                    <p>Status: <span class="cm-status-pending"><b>Pending</b></span></p>
                  </div>
                  <button id="cm-history-now" class="cm-wide">View Payment History</button>
                  <button id="cm-account-now" class="cm-wide cm-secondary">Back to Account</button>
                `);
                content.querySelector("#cm-history-now").onclick = paymentHistoryView;
                content.querySelector("#cm-account-now").onclick = accountView;
            } catch (error) {
                alert(error.message);
                button.disabled = false;
            }
        };
    }

    async function paymentHistoryView() {
        show(`<h3>Payment History</h3><div id="cm-history-list">Loading...</div><button id="cm-back" class="cm-wide cm-secondary">Back to Account</button>`);
        content.querySelector("#cm-back").onclick = accountView;
        try {
            const data = await api("/api/payments/history");
            const payments = Array.isArray(data.payments) ? data.payments : [];
            content.querySelector("#cm-history-list").innerHTML = payments.length ? payments.map(payment => `
              <div class="cm-card">
                <div class="cm-row"><b>₹${Number(payment.amount).toLocaleString("en-IN")}</b><span class="${statusClass(payment.status)}"><b>${statusLabel(payment.status)}</b></span></div>
                <p>${Number(payment.credits)} credits</p>
                <p class="cm-muted">UPI Ref: ${esc(payment.upiTransactionId || "Not available")}</p>
                <p class="cm-muted cm-small">${esc(payment.createdAt || "")}</p>
                ${payment.adminNote ? `<p class="cm-muted">Admin note: ${esc(payment.adminNote)}</p>` : ""}
              </div>
            `).join("") : '<p class="cm-muted">No payment submissions yet.</p>';
        } catch (error) {
            content.querySelector("#cm-history-list").innerHTML = `<p class="cm-error">${esc(error.message)}</p>`;
        }
    }

    function adminLoginView() {
        if (!current || String(current.email || "").toLowerCase() !== ADMIN_EMAIL) {
            return alert("Admin email account required.");
        }
        show(`
          <h3>Admin Payment Review</h3>
          <p class="cm-muted">Enter your Cloudflare ADMIN_SECRET. It is used only for this session and is not saved in browser storage.</p>
          <label>Admin Secret</label>
          <input id="cm-admin-secret" type="password" autocomplete="off" placeholder="Enter ADMIN_SECRET">
          <button id="cm-admin-continue" class="cm-wide">Open Admin Payments</button>
          <button id="cm-back" class="cm-wide cm-secondary">Back to Account</button>
        `);
        content.querySelector("#cm-back").onclick = accountView;
        content.querySelector("#cm-admin-continue").onclick = async () => {
            const secret = content.querySelector("#cm-admin-secret").value;
            if (!secret) return alert("Enter your admin secret.");
            adminSecret = secret;
            await adminPaymentsView();
        };
    }

    async function adminPaymentsView() {
        show(`<h3>Admin Payment Review</h3><div id="cm-admin-list">Loading pending payments...</div><button id="cm-admin-refresh" class="cm-wide cm-secondary">Refresh</button><button id="cm-admin-back" class="cm-wide cm-secondary">Back to Account</button>`);
        content.querySelector("#cm-admin-refresh").onclick = adminPaymentsView;
        content.querySelector("#cm-admin-back").onclick = accountView;
        try {
            const data = await api("/api/admin/payments?status=pending", { adminSecret });
            const payments = Array.isArray(data.payments) ? data.payments : [];
            content.querySelector("#cm-admin-list").innerHTML = payments.length ? payments.map(payment => `
              <div class="cm-card">
                <b>${esc(payment.email)}</b>
                <p>₹${Number(payment.amount).toLocaleString("en-IN")} • ${Number(payment.credits)} credits</p>
                <p class="cm-muted">UTR: <b>${esc(payment.upiTransactionId || "Not submitted")}</b></p>
                <p class="cm-muted cm-small">Payment ID: ${esc(payment.id)}</p>
                <button data-approve="${esc(payment.id)}">Approve & Add Credits</button>
                <button data-reject="${esc(payment.id)}" class="cm-secondary">Reject</button>
              </div>
            `).join("") : '<p class="cm-muted">No pending payments found.</p>';
            content.querySelectorAll("[data-approve]").forEach(button => {
                button.onclick = () => reviewPayment(button.dataset.approve, "approve");
            });
            content.querySelectorAll("[data-reject]").forEach(button => {
                button.onclick = () => reviewPayment(button.dataset.reject, "reject");
            });
        } catch (error) {
            adminSecret = "";
            content.querySelector("#cm-admin-list").innerHTML = `<p class="cm-error">${esc(error.message)}</p><button id="cm-admin-retry">Enter Admin Secret Again</button>`;
            content.querySelector("#cm-admin-retry").onclick = adminLoginView;
        }
    }

    async function reviewPayment(paymentId, action) {
        const verb = action === "approve" ? "approve this payment and add its credits" : "reject this payment";
        if (!confirm(`Are you sure you want to ${verb}?`)) return;
        const note = prompt("Optional admin note:") || "";
        try {
            const result = await api(`/api/admin/payments/${action}`, {
                method: "POST",
                body: { paymentId, adminNote: note },
                adminSecret
            });
            alert(result.message || "Payment updated.");
            await adminPaymentsView();
        } catch (error) {
            alert(error.message);
        }
    }

    fab.onclick = () => {
        if (panel.style.display === "block") {
            panel.style.display = "none";
            return;
        }
        if (localStorage.getItem(tokenKey)) accountView();
        else loginView();
    };
    root.querySelector("#cm-close").onclick = () => { panel.style.display = "none"; };

    if (localStorage.getItem(tokenKey)) {
        refreshCustomer().catch(() => {
            localStorage.removeItem(tokenKey);
            current = null;
            fab.textContent = "Login / Credits";
        });
    }
})();
