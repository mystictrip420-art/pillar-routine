const SUPABASE_URL =
    "https://kbowitimmtyhoaotuvos.supabase.co";

const SUPABASE_KEY =
    "sb_publishable_6taXtF0yZpq2ILtJVd8h0g_4mnXTu76";


const supabaseClient =
    window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_KEY
    );


// ===============================
// LOGIN
// ===============================

const loginScreen =
    document.getElementById("login-screen");

const routineScreen =
    document.getElementById("routine-screen");

const loginForm =
    document.getElementById("login-form");

const loginError =
    document.getElementById("login-error");


async function showSession() {

    const {
        data: { session }
    } = await supabaseClient.auth.getSession();


    if (session) {

        loginScreen.style.display = "none";

        routineScreen.style.display = "block";

        return true;
    }


    loginScreen.style.display = "flex";

    routineScreen.style.display = "none";

    return false;
}


loginForm.addEventListener(
    "submit",
    async (event) => {

        event.preventDefault();

        loginError.textContent = "";


        const email =
            document.getElementById("email").value.trim();

        const password =
            document.getElementById("password").value;


        console.log(
            "Intentando login con:",
            email
        );


        const {
            data,
            error
        } =
            await supabaseClient.auth.signInWithPassword({
                email,
                password
            });


        console.log(
            "Respuesta de Supabase:",
            data,
            error
        );


        if (error) {

            console.error(
                "SUPABASE LOGIN ERROR:",
                error
            );

            loginError.textContent =
                error.message;

            return;
        }


        await showSession();
    }
);


// ===============================
// ACTIVIDADES
// ===============================

const currentActivity =
    document.getElementById(
        "current-activity"
    );

const currentIcon =
    document.getElementById(
        "current-icon"
    );

const timerElement =
    document.getElementById(
        "timer"
    );

const stopButton =
    document.getElementById(
        "stop-activity"
    );

stopButton.disabled = true;

stopButton.addEventListener(
    "click",
    async () => {

        await stopCurrentActivity();

    }
);



const activityButtons =
    document.querySelectorAll(
        ".activity-button"
    );


const activities = {

    work: {
        name: "Trabajo",
        icon: "🏗️"
    },

    programming: {
        name: "Código",
        icon: "💻"
    },

    music: {
        name: "Música",
        icon: "🎵"
    },

    bible: {
        name: "Biblia",
        icon: "📖"
    },

    church: {
        name: "Iglesia",
        icon: "🙏"
    },

    food: {
        name: "Comida",
        icon: "🍽️"
    },

    rest: {
        name: "Descanso",
        icon: "😴"
    },

    personal: {
        name: "Personal",
        icon: "🏠"
    }

};


let startedAt = null;
let currentEventId = null;


async function setActivity(activityId) {

    const activity =
        activities[activityId];


    if (!activity) {
        return;
    }


    // Verificar que haya sesion
    const {
        data: { session }
    } = await supabaseClient.auth.getSession();


    if (!session) {

        console.error("No hay sesion activa.");

        return;
    }


    // Si ya existe una actividad,
    // primero la cerramos
    if (startedAt) {

        await stopCurrentActivity();
    }


    // Registrar nueva actividad en Supabase
    const {
        data,
        error
    } = await supabaseClient
        .from("routine_events")
        .insert({
            activity: activityId,
            started_at: new Date().toISOString(),
            user_id: session.user.id
        })
        .select()
        .single();


    if (error) {

        console.error(
            "Error iniciando actividad:",
            error
        );

        return;
    }


    console.log(
        "Actividad guardada:",
        data
    );


    // Guardemos el ID del registro
    currentEventId = data.id;


    stopButton.disabled = false;


    // Iniciar Timer local
    startedAt =
        new Date(data.started_at);

    currentActivity.textContent =
        activity.name;

    currentIcon.textContent =
        activity.icon;


    updateTimer();
}


async function stopCurrentActivity() {

    if (!currentEventId) {
        return;
    }


    const endedAt =
        new Date().toISOString();


    const{
        data,
        error
    } = await supabaseClient
        .from("routine_events")
        .update({
            ended_at: endedAt
        })
        .eq("id", currentEventId)
        .select()
        .single();


    if (error) {
        console.error(
            "Error terminando actividad.",
            error
        );

        return
    }


    console.log(
        "Actividad terminada:",
        data
    );


    startedAt = null;
    currentEventOd = null;

    stopBuutton.disabled = true;

    currentActivity.textContent =
        "Sin actividad";

    currentIcon.textContent =
        "⏸️";

    timerElement.textContent =
        "00:00:00";

}

function updateTimer() {

    if (!startedAt) {

        timerElement.textContent = "00:00:00";

        return;

    }


    const now =
        new Date();


    const elapsed =
        Math.floor(
            (now - startedAt) / 1000
        );


    const hours =
        Math.floor(
            elapsed / 3600
        );


    const minutes =
        Math.floor(
            (elapsed % 3600) / 60
        );


    const seconds =
        elapsed % 60;


    timerElement.textContent =
        String(hours).padStart(2, "0") +
        ":" +
        String(minutes).padStart(2, "0") +
        ":" +
        String(seconds).padStart(2, "0");
}


activityButtons.forEach(
    (button) => {

        button.addEventListener(
            "click",
            () => {

                const activityId =
                    button.dataset.activity;


                setActivity(
                    activityId
                );

            }
        );

    }
);


currentActivity.textContent = "Sin actividad";
currentIcon.textContent = "⏸️";
timerElement.textContent = "00:00:00";

setInterval(
    updateTimer,
    1000
);


// ===============================
// INICIAR
// ===============================

showSession();
