let limit = 5; // Hur många inlägg vi hämtar åt gången
let skip = 0; // Hur många vi ska hoppa över (pagination)
let loading = false; // Förhindra flera anrop samtidigt

async function fetchPosts() {
    if (loading) return;
    loading = true;

    try {
        const response = await fetch(`https://dummyjson.com/posts?limit=${limit}&skip=${skip}`);
        if (!response.ok) throw new Error("Failed to load posts");
        
        const data = await response.json();
        if (!data.posts || data.posts.length === 0) throw new Error("No posts found");

        const postsWithDetails = await Promise.all(data.posts.map(async post => {
            try {
                const userResponse = await fetch(`https://dummyjson.com/users/${post.userId}`);
                if (!userResponse.ok) throw new Error("Failed to load user");
                const userData = await userResponse.json();

                const commentsResponse = await fetch(`https://dummyjson.com/comments/post/${post.id}`);
                if (!commentsResponse.ok) throw new Error("Failed to load comments");
                const commentsData = await commentsResponse.json();

                return { 
                    ...post, 
                    username: userData.username || "Unknown", 
                    comments: commentsData.comments || [] 
                };
            } catch (error) {
                console.error(`Error fetching details for post ${post.id}:`, error);
                return { ...post, username: "Unknown", comments: [] }; // Sätt defaultvärden vid fel
            }
        }));

        displayPosts(postsWithDetails);
        skip += limit;
    } catch (error) {
        console.error("Error fetching posts:", error);
        document.getElementById("posts-container").innerHTML = `<p class="error-message">${error.message}</p>`;
    } finally {
        loading = false;
    }
}






function displayPosts(posts) {
    const postsContainer = document.getElementById("posts-container");

    if (!posts || posts.length === 0) {
        postsContainer.innerHTML = "<p class='error-message'>No posts available.</p>";
        return;
    }

    posts.forEach(post => {
        const postElement = document.createElement("article");
        postElement.classList.add("post");

        // Skapa en kommentarsektion
        const commentsSection = document.createElement("section");
        commentsSection.classList.add("comments-section");

        if (post.comments && post.comments.length > 0) {
            commentsSection.innerHTML = `<h3>Comments:</h3>`;

            // Visa endast två kommentarer från början
            post.comments.forEach(comment => {
                const commentElement = document.createElement("p");
                commentElement.classList.add("comment");
                commentElement.innerHTML = `<strong>${comment.user?.username || "Unknown"}:</strong> ${comment.body}`;
                commentsSection.appendChild(commentElement);
            });            
        } else {
            commentsSection.innerHTML = `<p class="no-comments">No comments available.</p>`;
        }

        // Lägg till kommentarer under inlägget
        postElement.innerHTML = `
            <h2>${post.title || "Untitled Post"}</h2>
            <p class="post-body">${post.body || "No content available."}</p>
            <p class="post-meta">
                By: <a href="#" class="user-link" data-userid="${post.userId}">${post.username || "Unknown"}</a>
            </p>
            <p class="post-meta">Tags: ${post.tags?.join(", ") || "No tags"}</p>
            <p class="post-meta">👍 Likes: ${post.reactions?.likes || 0} | 👎 Dislikes: ${post.reactions?.dislikes || 0}</p>
        `;

        postElement.appendChild(commentsSection);
        postsContainer.appendChild(postElement);
    });

    // Lägg till eventlistener på alla användarnamn för att öppna modalen
    document.querySelectorAll(".user-link").forEach(link => {
        link.addEventListener("click", (event) => {
            event.preventDefault();
            const userId = event.target.getAttribute("data-userid");
            openUserModal(userId);
        });
    });
}



fetchPosts();


window.addEventListener("scroll", () => {
    if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 200) {
        fetchPosts(); // Hämta fler inlägg när användaren når botten
    }
});

window.addEventListener("scroll", () => {
    const modal = document.getElementById("user-modal");
    if (modal.style.display === "flex") return; // 🔴 Stoppa infinite scroll om modalen är öppen

    if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 200) {
        fetchPosts(); // Hämta fler inlägg när användaren når botten
    }
});





async function openUserModal(userId) {
    if (!userId) return; // Förhindra att modalen öppnas utan användare

    try {
        const response = await fetch(`https://dummyjson.com/users/${userId}`);
        const user = await response.json();

        const modalBody = document.getElementById("user-modal-body");
        modalBody.innerHTML = `
            <h2>${user.firstName} ${user.lastName}</h2>
            <p><strong>Username:</strong> ${user.username}</p>
            <p><strong>Email:</strong> ${user.email}</p>
            <p><strong>Location:</strong> ${user.address.city}, ${user.address.state}</p>
            <h3>Posts by ${user.username}</h3>
            <section id="modal-user-posts" class="posts-container">
                <p>Loading posts...</p>
            </section>
        `;

        document.getElementById("user-modal").style.display = "flex"; // Öppna modalen
        fetchUserPosts(userId);
    } catch (error) {
        console.error("Error fetching user data:", error);
    }
}


// Stäng modal när man klickar på "×"
document.querySelector(".close").addEventListener("click", () => {
    document.getElementById("user-modal").style.display = "none";
});

// Stäng modal om man klickar utanför innehållet
window.addEventListener("click", (event) => {
    const modal = document.getElementById("user-modal");
    if (event.target === modal) {
        modal.style.display = "none";
    }
});







async function fetchUserPosts(userId) {
    try {
        const response = await fetch(`https://dummyjson.com/posts/user/${userId}`);
        const data = await response.json();

        const userPosts = document.getElementById("modal-user-posts");
        userPosts.innerHTML = "";

        if (!data.posts || data.posts.length === 0) {
            userPosts.innerHTML = "<p class='error-message'>No posts found for this user.</p>";
            return;
        }

        data.posts.forEach(post => {
            const postElement = document.createElement("article");
            postElement.classList.add("post");

            postElement.innerHTML = `
                <h2>${post.title}</h2>
                <p class="post-body">${post.body}</p>
                <p class="post-meta">Tags: ${post.tags?.join(", ") || "No tags"}</p>
                <p class="post-meta">👍 Likes: ${post.reactions?.likes || 0}</p>
                <p class="post-meta">👎 Dislikes: ${post.reactions?.dislikes || 0}</p>
            `;

            userPosts.appendChild(postElement);
        });
    } catch (error) {
        console.error("Error fetching user posts:", error);
    }
}
