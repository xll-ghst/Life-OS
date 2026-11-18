const API_URL = "/api/v1/tasks/";

const taskList = document.querySelector("#task-list");
const taskForm = document.querySelector("#task-form");
const addTaskButton = document.querySelector("#add-task");
const message = document.querySelector("#message");

let tasks = [];

const priorityLabels = {
    low: "Низкий",
    medium: "Средний",
    high: "Высокий",
};

// Функция для получения CSRF-токена из cookies
function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== "") {
        const cookies = document.cookie.split(";");
        for (let cookie of cookies) {
            cookie = cookie.trim();
            if (cookie.startsWith(name + "=")) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}
const csrftoken = getCookie("csrftoken");

function showMessage(text) {
    message.textContent = text;
}

async function apiRequest(url, options = {}) {
    const response = await fetch(url, {
        ...options,
        headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": csrftoken,
            ...options.headers,
        },
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(Object.values(error).flat().join(" ") || "Ошибка запроса");
    }

    return response.status === 204 ? null : response.json();
}

function renderTasks() {
    taskList.replaceChildren();

    if (tasks.length === 0) {
        const empty = document.createElement("p");
        empty.className = "muted";
        empty.textContent = "Квестов пока нет. Создай первое задание!";
        taskList.append(empty);
        updateStats();
        return;
    }

    tasks.forEach((task) => {
        const card = document.createElement("article");
        card.className = `task-card${task.is_completed ? " done" : ""}`;

        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.className = "task-check";
        checkbox.checked = task.is_completed;

        checkbox.addEventListener("change", async () => {
            checkbox.disabled = true;
            try {
                await apiRequest(`${API_URL}${task.id}/`, {
                    method: "PATCH",
                    body: JSON.stringify({ is_completed: checkbox.checked }),
                });
                await loadTasks();
                showMessage(
                    checkbox.checked
                        ? `Квест завершён! Награда: ${task.xp_reward} XP`
                        : "Статус задачи изменён."
                );
            } catch (error) {
                checkbox.checked = !checkbox.checked;
                showMessage(error.message);
            } finally {
                checkbox.disabled = false;
            }
        });

        const info = document.createElement("div");
        info.className = "task-info";

        const title = document.createElement("div");
        title.className = "task-title";
        title.textContent = task.title;

        const meta = document.createElement("div");
        meta.className = "task-meta";

        const category = document.createElement("span");
        category.className = "tag";
        category.textContent = task.category;

        const priority = document.createElement("span");
        priority.className = `tag priority-${task.priority}`;
        priority.textContent = priorityLabels[task.priority] || task.priority;

        meta.append(category, priority);
        info.append(title, meta);

        const xp = document.createElement("span");
        xp.className = "task-xp";
        xp.textContent = `+${task.xp_reward} XP`;

        const deleteButton = document.createElement("button");
        deleteButton.className = "delete-task";
        deleteButton.textContent = "✕";

        deleteButton.addEventListener("click", async () => {
            if (!confirm(`Удалить квест «${task.title}»?`)) return;
            try {
                await apiRequest(`${API_URL}${task.id}/`, { method: "DELETE" });
                await loadTasks();
                showMessage("Квест удалён.");
            } catch (error) {
                showMessage(error.message);
            }
        });

        card.append(checkbox, info, xp, deleteButton);
        taskList.append(card);
    });

    updateStats();
}

function updateStats() {
    const completedTasks = tasks.filter((task) => task.is_completed);
    const totalXP = completedTasks.reduce((sum, task) => sum + task.xp_reward, 0);

    const level = Math.floor(totalXP / 100) + 1;
    const xpInLevel = totalXP % 100;

    document.querySelector("#xp").textContent = totalXP;
    document.querySelector("#completed").textContent = completedTasks.length;
    document.querySelector("#level").textContent = level;
    document.querySelector("#level-stat").textContent = String(level).padStart(2, "0");
    document.querySelector("#xp-bar").style.width = `${xpInLevel}%`;
    document.querySelector("#xp-caption").textContent =
        `${xpInLevel} / 100 XP до следующего уровня`;
}

async function loadTasks() {
    try {
        const data = await apiRequest(API_URL);
        tasks = Array.isArray(data) ? data : data.results || [];
        renderTasks();
    } catch (error) {
        taskList.textContent = `Не удалось загрузить квесты: ${error.message}`;
    }
}

addTaskButton.addEventListener("click", () => {
    taskForm.classList.toggle("hidden");
    if (!taskForm.classList.contains("hidden")) {
        document.querySelector("#task-title").focus();
    }
});

taskForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const title = document.querySelector("#task-title").value.trim();
    const category = document.querySelector("#task-category").value.trim() || "Другое";
    const priority = document.querySelector("#task-priority").value;
    const xpReward = Number(document.querySelector("#task-xp").value);

    if (!title || xpReward < 0 || xpReward > 10000) {
        showMessage("Проверь название задачи и награду XP.");
        return;
    }

    try {
        await apiRequest(API_URL, {
            method: "POST",
            body: JSON.stringify({ title, category, priority, xp_reward: xpReward }),
        });
        taskForm.reset();
        document.querySelector("#task-category").value = "Другое";
        document.querySelector("#task-xp").value = "10";
        taskForm.classList.add("hidden");
        await loadTasks();
        showMessage("Новый квест добавлен!");
    } catch (error) {
        showMessage(error.message);
    }
});

loadTasks();
