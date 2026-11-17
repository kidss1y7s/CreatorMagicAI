/* =====================================================
   CREATORMAGIC AI
   COMPLETE SCRIPT.JS
   PROMPT GENERATION EDITION
   VERSION 3.0
===================================================== */


/* =====================================================
   1. CONFIGURATION
===================================================== */

const CM_CONFIG = {

    apiURL: "https://creatormagic-ai.kidss1y7s.workers.dev",

    version: "3.0",

    language: "English"

};


/* =====================================================
   2. CLOUDFLARE AI CONNECTION
===================================================== */

async function callCreatorMagicAPI(endpoint, data) {

    try {

        const response = await fetch(

            CM_CONFIG.apiURL + endpoint,

            {

                method: "POST",

                headers: {

                    "Content-Type": "application/json"

                },

                body: JSON.stringify(data)

            }

        );

        const result = await response.json();

        if (!response.ok || result.success === false) {

            throw new Error(

                result.error ||
                result.message ||
                "AI generation failed."

            );

        }

        return result;

    }

    catch(error) {

        console.error(

            "CreatorMagic API Error:",
            error

        );

        throw error;

    }

}


/* =====================================================
   3. DESIGN FUNCTIONS
===================================================== */

function inputStyle() {

    return `

        width:100%;
        padding:13px;
        margin-top:8px;
        margin-bottom:15px;
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


function escapeHTML(value) {

    return String(value).replace(

        /[&<>"']/g,

        function(character) {

            return {

                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                '"': "&quot;",
                "'": "&#039;"

            }[character];

        }

    );

}


function getValue(id) {

    const element = document.getElementById(id);

    return element
        ? element.value.trim()
        : "";

}


function showOutput(id, content) {

    const element = document.getElementById(id);

    if (element) {

        element.textContent = content;

    }

}


function setLoading(button, loading) {

    if (!button) return;

    if (loading) {

        button.dataset.originalText =
            button.innerHTML;

        button.innerHTML =
            "⏳ Creating with AI...";

        button.disabled = true;

        button.style.opacity = "0.6";

    }

    else {

        button.innerHTML =
            button.dataset.originalText || "Generate";

        button.disabled = false;

        button.style.opacity = "1";

    }

}


/* =====================================================
   4. COPY SYSTEM
===================================================== */

function copyText(text) {

    if (!text) {

        alert("Nothing to copy!");

        return;

    }

    if (
        navigator.clipboard &&
        window.isSecureContext
    ) {

        navigator.clipboard.writeText(text)

            .then(function() {

                alert("Copied successfully!");

            })

            .catch(function() {

                fallbackCopy(text);

            });

    }

    else {

        fallbackCopy(text);

    }

}


function fallbackCopy(text) {

    const textarea =
        document.createElement("textarea");

    textarea.value = text;

    textarea.style.position = "fixed";

    textarea.style.opacity = "0";

    document.body.appendChild(textarea);

    textarea.select();

    try {

        document.execCommand("copy");

        alert("Copied successfully!");

    }

    catch(error) {

        alert("Please copy manually.");

    }

    document.body.removeChild(textarea);

}


/* =====================================================
   5. DOWNLOAD TEXT
===================================================== */

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

    URL.revokeObjectURL(url);

}


/* =====================================================
   6. MODAL SYSTEM
===================================================== */

function closeExistingModal() {

    const oldModal =
        document.getElementById("creatorMagicModal");

    if (oldModal) {

        oldModal.remove();

    }

}


function createModal(title, subtitle, content) {

    closeExistingModal();

    const modal = document.createElement("div");

    modal.id = "creatorMagicModal";

    modal.style.cssText = `

        position:fixed;
        inset:0;
        z-index:99999;
        background:rgba(0,0,0,0.88);
        display:flex;
        justify-content:center;
        align-items:center;
        padding:15px;
        overflow-y:auto;

    `;

    modal.innerHTML = `

        <div style="

            width:100%;
            max-width:750px;
            max-height:92vh;
            overflow-y:auto;
            background:#101024;
            color:white;
            padding:25px;
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

                <button onclick="closeTool()"

                    style="

                        background:#ef4444;
                        color:white;
                        border:none;
                        border-radius:8px;
                        padding:9px 14px;
                        cursor:pointer;

                    ">

                    ✕

                </button>

            </div>

            <p style="color:#cbd5e1;margin:12px 0 20px;">

                ${escapeHTML(subtitle)}

            </p>

            ${content}

        </div>

    `;

    modal.addEventListener(

        "click",

        function(event) {

            if (event.target === modal) {

                closeTool();

            }

        }

    );

    document.body.appendChild(modal);

}


function closeTool() {

    closeExistingModal();

}


/* =====================================================
   7. OPEN STUDIOS
===================================================== */

function openTool(tool) {

    if (tool === "image") {

        openImageStudio();

    }

    else if (tool === "video") {

        openVideoStudio();

    }

    else if (tool === "reel") {

        openReelStudio();

    }

    else if (tool === "story") {

        openStoryStudio();

    }

    else if (tool === "source") {

        alert(
            "Source to Video Studio is temporarily disabled."
        );

    }

    else {

        alert("Studio not found.");

    }

}


/* =====================================================
   8. AI IMAGE STUDIO
   PROFESSIONAL IMAGE PROMPT GENERATOR
===================================================== */

function openImageStudio() {

    const content = `

        <label style="${labelStyle()}">

            Describe Your Image

        </label>

        <textarea
            id="imageIdea"
            placeholder="Example: A cute baby elephant in a magical jungle near a waterfall..."
            style="${inputStyle()}height:110px;"
        ></textarea>


        <label style="${labelStyle()}">

            Art Style

        </label>

        <select id="imageStyle" style="${inputStyle()}">

            <option value="Pixar-inspired premium 3D animation">

                Pixar Inspired 3D

            </option>

            <option value="Professional cinematic 3D animation">

                Cinematic 3D

            </option>

            <option value="Photorealistic professional photography">

                Realistic Photography

            </option>

            <option value="Beautiful anime illustration">

                Anime

            </option>

            <option value="Premium children's storybook illustration">

                Children's Illustration

            </option>

            <option value="Fantasy digital artwork">

                Fantasy Art

            </option>

            <option value="Watercolour painting">

                Watercolour

            </option>

        </select>


        <label style="${labelStyle()}">

            Lighting

        </label>

        <select id="imageLighting" style="${inputStyle()}">

            <option value="Beautiful cinematic lighting">

                Cinematic Lighting

            </option>

            <option value="Warm golden hour sunlight">

                Golden Hour

            </option>

            <option value="Soft natural daylight">

                Natural Daylight

            </option>

            <option value="Magical glowing fantasy lighting">

                Magical Lighting

            </option>

            <option value="Professional studio lighting">

                Studio Lighting

            </option>

        </select>


        <label style="${labelStyle()}">

            Image Ratio

        </label>

        <select id="imageRatio" style="${inputStyle()}">

            <option value="1:1">Square</option>

            <option value="9:16">Portrait</option>

            <option value="16:9">Landscape</option>

        </select>


        <label style="${labelStyle()}">

            Image Quality

        </label>

        <select id="imageQuality" style="${inputStyle()}">

            <option value="Ultra detailed professional quality">

                Ultra Detailed

            </option>

            <option value="Highly detailed textures and realistic details">

                High Detail

            </option>

            <option value="Professional commercial artwork quality">

                Professional Quality

            </option>

        </select>


        <button

            id="imageGenerateButton"

            onclick="generateImagePrompt()"

            style="${buttonStyle()}"

        >

            ✨ Generate Professional Image Prompt

        </button>


        <div id="imageResult" style="${outputStyle()}">

            Your professional image prompt will appear here.

        </div>


        <button

            onclick="copyImagePrompt()"

            style="${buttonStyle()}"

        >

            📋 Copy Image Prompt

        </button>


        <button

            onclick="downloadImagePrompt()"

            style="${buttonStyle()}"

        >

            ⬇️ Download Prompt

        </button>


        <p style="color:#c4b5fd;font-size:12px;">

            Create professional prompts for external AI image tools.
            Actual image generation is disabled.

        </p>

    `;

    createModal(

        "✨ AI Image Studio",

        "Create professional AI image prompts.",

        content

    );

}


async function generateImagePrompt() {

    const idea = getValue("imageIdea");

    if (!idea) {

        alert("Please describe your image.");

        return;

    }

    const button =
        document.getElementById("imageGenerateButton");

    setLoading(button, true);

    showOutput(

        "imageResult",

        "✨ Creating your professional image prompt..."

    );

    try {

        const result = await callCreatorMagicAPI(

            "/api/image",

            {

                prompt: idea,

                idea: idea,

                style: getValue("imageStyle"),

                lighting: getValue("imageLighting"),

                ratio: getValue("imageRatio"),

                quality: getValue("imageQuality")

            }

        );

        const prompt =

            result.prompt ||
            result.result ||
            result.output ||
            result.text;

        if (!prompt) {

            throw new Error(
                "AI returned an empty image prompt."
            );

        }

        window.currentImagePrompt = prompt;

        showOutput("imageResult", prompt);

    }

    catch(error) {

        showOutput(

            "imageResult",

            "Error: " + error.message

        );

        alert(error.message);

    }

    finally {

        setLoading(button, false);

    }

}


function copyImagePrompt() {

    copyText(window.currentImagePrompt);

}


function downloadImagePrompt() {

    downloadText(

        "CreatorMagic-Image-Prompt.txt",

        window.currentImagePrompt

    );

}


/* =====================================================
   9. AI VIDEO STUDIO
   CINEMATIC VIDEO PROMPT GENERATOR
===================================================== */

function openVideoStudio() {

    const content = `

        <label style="${labelStyle()}">

            Describe Your Video

        </label>

        <textarea

            id="videoIdea"

            placeholder="Example: A cute baby elephant discovers a magical waterfall..."

            style="${inputStyle()}height:110px;"

        ></textarea>


        <label style="${labelStyle()}">

            Video Style

        </label>

        <select id="videoStyle" style="${inputStyle()}">

            <option value="Premium cinematic 3D cartoon animation">

                Cinematic 3D Cartoon

            </option>

            <option value="Pixar-inspired 3D animation">

                Pixar Inspired

            </option>

            <option value="Photorealistic cinematic video">

                Realistic Cinematic

            </option>

            <option value="Beautiful fantasy animation">

                Fantasy Animation

            </option>

            <option value="Professional anime animation">

                Anime

            </option>

            <option value="Children's animated story">

                Children's Animation

            </option>

        </select>


        <label style="${labelStyle()}">

            Video Duration

        </label>

        <select id="videoDuration" style="${inputStyle()}">

            <option value="5 seconds">5 Seconds</option>

            <option value="10 seconds">10 Seconds</option>

            <option value="15 seconds">15 Seconds</option>

            <option value="20 seconds">20 Seconds</option>

            <option value="30 seconds">30 Seconds</option>

            <option value="60 seconds">60 Seconds</option>

        </select>


        <label style="${labelStyle()}">

            Camera Movement

        </label>

        <select id="videoCamera" style="${inputStyle()}">

            <option value="Smooth cinematic tracking camera movement">

                Tracking Shot

            </option>

            <option value="Slow cinematic zoom in">

                Zoom In

            </option>

            <option value="Smooth cinematic zoom out">

                Zoom Out

            </option>

            <option value="Beautiful aerial drone movement">

                Drone Movement

            </option>

            <option value="Smooth 360 degree camera rotation">

                360 Degree Rotation

            </option>

            <option value="Dynamic camera movement with close-up shots">

                Dynamic Camera

            </option>

            <option value="Slow cinematic pan movement">

                Cinematic Pan

            </option>

        </select>


        <label style="${labelStyle()}">

            Animation Detail

        </label>

        <select id="videoAnimation" style="${inputStyle()}">

            <option value="Smooth realistic character animation and natural movements">

                Smooth Character Animation

            </option>

            <option value="Detailed facial expressions and natural body movements">

                Facial Expressions

            </option>

            <option value="Professional 3D character animation">

                3D Character Animation

            </option>

            <option value="Natural environmental animation with moving water and leaves">

                Environmental Animation

            </option>

        </select>


        <button

            id="videoGenerateButton"

            onclick="generateVideoPrompt()"

            style="${buttonStyle()}"

        >

            🎬 Generate Cinematic Video Prompt

        </button>


        <div id="generatedVideo" style="${outputStyle()}">

            Your cinematic video prompt will appear here.

        </div>


        <button onclick="copyVideoPrompt()" style="${buttonStyle()}">

            📋 Copy Video Prompt

        </button>


        <button onclick="downloadVideoPrompt()" style="${buttonStyle()}">

            ⬇️ Download Prompt

        </button>

    `;

    createModal(

        "🎬 AI Video Studio",

        "Create professional cinematic video prompts.",

        content

    );

}


async function generateVideoPrompt() {

    const idea = getValue("videoIdea");

    if (!idea) {

        alert("Please enter your video idea.");

        return;

    }

    const button =
        document.getElementById("videoGenerateButton");

    setLoading(button, true);

    showOutput(

        "generatedVideo",

        "🎬 Creating your cinematic video prompt..."

    );

    try {

        const result = await callCreatorMagicAPI(

            "/api/video",

            {

                prompt: idea,

                style: getValue("videoStyle"),

                duration: getValue("videoDuration"),

                camera: getValue("videoCamera"),

                animation: getValue("videoAnimation"),

                quality: "Professional cinematic quality"

            }

        );

        const prompt =

            result.prompt ||
            result.result ||
            result.output;

        if (!prompt) {

            throw new Error(
                "AI returned an empty video prompt."
            );

        }

        window.currentVideoPrompt = prompt;

        showOutput("generatedVideo", prompt);

    }

    catch(error) {

        showOutput(

            "generatedVideo",

            "Error: " + error.message

        );

        alert(error.message);

    }

    finally {

        setLoading(button, false);

    }

}


function copyVideoPrompt() {

    copyText(window.currentVideoPrompt);

}


function downloadVideoPrompt() {

    downloadText(

        "CreatorMagic-Video-Prompt.txt",

        window.currentVideoPrompt

    );

}


/* =====================================================
   10. INSTAGRAM REEL STUDIO
===================================================== */

function openReelStudio() {

    const content = `

        <label style="${labelStyle()}">

            Reel Topic

        </label>

        <textarea

            id="reelTopic"

            placeholder="Enter your reel topic..."

            style="${inputStyle()}height:100px;"

        ></textarea>


        <label style="${labelStyle()}">

            Category

        </label>

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


        <label style="${labelStyle()}">

            Language

        </label>

        <select id="reelLanguage" style="${inputStyle()}">

            <option value="English">English</option>

            <option value="Hindi">Hindi</option>

            <option value="Marathi">Marathi</option>

        </select>


        <label style="${labelStyle()}">

            Duration

        </label>

        <select id="reelDuration" style="${inputStyle()}">

            <option value="15 seconds">15 Seconds</option>

            <option value="30 seconds">30 Seconds</option>

            <option value="45 seconds">45 Seconds</option>

            <option value="60 seconds">60 Seconds</option>

        </select>


        <button

            id="reelGenerateButton"

            onclick="generateReel()"

            style="${buttonStyle()}"

        >

            🚀 Generate Professional Reel

        </button>


        <div id="generatedReel" style="${outputStyle()}">

            Your Instagram Reel content will appear here.

        </div>


        <button onclick="copyReel()" style="${buttonStyle()}">

            📋 Copy Reel

        </button>


        <button onclick="downloadReel()" style="${buttonStyle()}">

            ⬇️ Download Reel Content

        </button>

    `;

    createModal(

        "📱 Instagram Reel Studio",

        "Create engaging reels with professional scripts and captions.",

        content

    );

}


async function generateReel() {

    const topic = getValue("reelTopic");

    if (!topic) {

        alert("Enter your reel topic.");

        return;

    }

    const button =
        document.getElementById("reelGenerateButton");

    setLoading(button, true);

    showOutput(

        "generatedReel",

        "🚀 Creating your Instagram Reel..."

    );

    try {

        const result = await callCreatorMagicAPI(

            "/api/reel",

            {

                topic: topic,

                niche: getValue("reelCategory"),

                language: getValue("reelLanguage"),

                duration: getValue("reelDuration")

            }

        );

        const reel =

            result.result ||
            result.story ||
            result.prompt ||
            result.output;

        if (!reel) {

            throw new Error(
                "AI returned empty reel content."
            );

        }

        window.currentReel = reel;

        showOutput("generatedReel", reel);

    }

    catch(error) {

        showOutput(

            "generatedReel",

            "Error: " + error.message

        );

        alert(error.message);

    }

    finally {

        setLoading(button, false);

    }

}


function copyReel() {

    copyText(window.currentReel);

}


function downloadReel() {

    downloadText(

        "CreatorMagic-Instagram-Reel.txt",

        window.currentReel

    );

}


/* =====================================================
   11. AI STORY STUDIO
===================================================== */

function openStoryStudio() {

    const content = `

        <label style="${labelStyle()}">

            Story Idea

        </label>

        <textarea

            id="storyIdea"

            placeholder="Describe your story idea..."

            style="${inputStyle()}height:100px;"

        ></textarea>


        <label style="${labelStyle()}">

            Story Category

        </label>

        <select id="storyCategory" style="${inputStyle()}">

            <option value="Moral Story">Moral Story</option>

            <option value="Bedtime Story">Bedtime Story</option>

            <option value="Adventure Story">Adventure Story</option>

            <option value="Animal Story">Animal Story</option>

            <option value="Educational Story">Educational Story</option>

            <option value="Fantasy Story">Fantasy Story</option>

            <option value="Devotional Story">Devotional Story</option>

        </select>


        <label style="${labelStyle()}">

            Language

        </label>

        <select id="storyLanguage" style="${inputStyle()}">

            <option value="English">English</option>

            <option value="Hindi">Hindi</option>

            <option value="Marathi">Marathi</option>

        </select>


        <label style="${labelStyle()}">

            Art Style

        </label>

        <select id="storyStyle" style="${inputStyle()}">

            <option value="Pixar-inspired 3D animation">

                Pixar Inspired 3D

            </option>

            <option value="Professional cinematic 3D cartoon">

                Cinematic 3D

            </option>

            <option value="Watercolour illustration">

                Watercolour

            </option>

            <option value="Fantasy digital artwork">

                Fantasy

            </option>

            <option value="Children's storybook illustration">

                Children's Illustration

            </option>

        </select>


        <button

            id="storyGenerateButton"

            onclick="generateStory()"

            style="${buttonStyle()}"

        >

            📖 Generate Complete AI Story

        </button>


        <div id="generatedStory" style="${outputStyle()}">

            Your AI story will appear here.

        </div>


        <button onclick="copyStory()" style="${buttonStyle()}">

            📋 Copy Story

        </button>


        <button onclick="downloadStory()" style="${buttonStyle()}">

            ⬇️ Download Story

        </button>

    `;

    createModal(

        "📚 AI Story Studio",

        "Create original stories with scene-by-scene prompts.",

        content

    );

}


async function generateStory() {

    const idea = getValue("storyIdea");

    if (!idea) {

        alert("Enter your story idea.");

        return;

    }

    const button =
        document.getElementById("storyGenerateButton");

    setLoading(button, true);

    showOutput(

        "generatedStory",

        "📖 Creating your complete AI story..."

    );

    try {

        const result = await callCreatorMagicAPI(

            "/api/story",

            {

                topic: idea,

                prompt: idea,

                characters: "Create suitable original characters",

                age: "Children",

                language: getValue("storyLanguage"),

                category: getValue("storyCategory"),

                style: getValue("storyStyle")

            }

        );

        const story =

            result.story ||
            result.result ||
            result.prompt ||
            result.output;

        if (!story) {

            throw new Error(
                "AI returned empty story content."
            );

        }

        window.currentStory = story;

        showOutput("generatedStory", story);

    }

    catch(error) {

        showOutput(

            "generatedStory",

            "Error: " + error.message

        );

        alert(error.message);

    }

    finally {

        setLoading(button, false);

    }

}


function copyStory() {

    copyText(window.currentStory);

}


function downloadStory() {

    downloadText(

        "CreatorMagic-AI-Story.txt",

        window.currentStory

    );

}


/* =====================================================
   12. SOURCE TO VIDEO
   ORIGINAL CODE PRESERVED
   TEMPORARILY HIDDEN
===================================================== */

function addSourceTextInput() {

    const sourceURL =
        document.getElementById("sourceURL");

    if (!sourceURL) return;

    if (document.getElementById("sourceContent")) return;

    const container = sourceURL.parentElement;

    const wrapper = document.createElement("div");

    wrapper.innerHTML = `

        <label style="${labelStyle()}">

            Source Transcript / Article Content

        </label>

        <textarea

            id="sourceContent"

            placeholder="Paste your complete transcript or article text..."

            style="${inputStyle()}height:180px;"

        ></textarea>

    `;

    const result =
        document.getElementById("sourceResult");

    if (result) {

        container.insertBefore(wrapper, result);

    }

    else {

        container.appendChild(wrapper);

    }

}


function openSourceStudio() {

    const section =
        document.getElementById("sourceStudio");

    if (!section) return;

    section.style.display = "none";

    alert(
        "Source to Video Studio is temporarily disabled."
    );

}


function validateSourceURL(url) {

    try {

        const parsedURL = new URL(url);

        return (

            parsedURL.protocol === "https:" ||
            parsedURL.protocol === "http:"

        );

    }

    catch(error) {

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

        alert("Please enter a valid URL.");

        return;

    }

    if (!sourceText || sourceText.length < 100) {

        alert("Please paste at least 100 characters of transcript or article text.");

        return;

    }

    if (sourceText.length > 18000) {

        alert("Please limit source content to 18,000 characters.");

        return;

    }

    const result =
        document.getElementById("sourceResult");

    if (!result) return;

    result.textContent =
        "Analysing source...";

    try {

        const aiResult = await callCreatorMagicAPI(

            "/api/source-to-video",

            {

                transcript: sourceText,

                videoType: videoType,

                language: language,

                duration: duration

            }

        );

        window.currentSourceStoryboard =
            aiResult.analysis;

        result.textContent =
            aiResult.analysis;

    }

    catch(error) {

        result.textContent =
            "Analysis Error: " + error.message;

    }

}


function generateSourceVideo() {

    analyseSource();

}


function copySourceVideo() {

    copyText(window.currentSourceStoryboard);

}


/* =====================================================
   13. KEYBOARD SUPPORT
===================================================== */

document.addEventListener(

    "keydown",

    function(event) {

        if (event.key === "Escape") {

            closeTool();

        }

    }

);


/* =====================================================
   14. STARTUP
===================================================== */

document.addEventListener(

    "DOMContentLoaded",

    function() {

        const sourceSection =
            document.getElementById("sourceStudio");

        if (sourceSection) {

            sourceSection.style.display = "none";

        }

        console.log(
            "CreatorMagic AI loaded successfully!"
        );

        console.log(
            "Version: " + CM_CONFIG.version
        );

        console.log(
            "AI Image Studio: Prompt Generation"
        );

        console.log(
            "AI Video Studio: Prompt Generation"
        );

        console.log(
            "Instagram Reel Studio: Ready"
        );

        console.log(
            "AI Story Studio: Ready"
        );

        console.log(
            "Source to Video: Temporarily Hidden"
        );

    }

);


/* =====================================================
   END OF CREATORMAGIC AI
===================================================== */