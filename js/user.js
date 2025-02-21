// Hämta användarens ID från URL:en
function getUserIdFromURL() {
    const params = new URLSearchParams(window.location.search);
    return params.get("id"); // Returnerar userId från ?id=1
}




async function fetchUserProfile() {
    const userId = getUserIdFromURL();
    if (!userId) {
        console.error("No user ID found in URL.");
        return;
    }

    try {
        const response = await fetch(`https://dummyjson.com/users/${userId}`);
        const user = await response.json();

        // Hitta elementet där vi ska visa profilen
        const userProfile = document.getElementById("user-profile");
        userProfile.innerHTML = `
            <h1>${user.firstName} ${user.lastName}</h1>
            <p><strong>Username:</strong> ${user.username}</p>
            <p><strong>Email:</strong> ${user.email}</p>
            <p><strong>Location:</strong> ${user.address.city}, ${user.address.state}</p>
        `;
    } catch (error) {
        console.error("Error fetching user profile:", error);
    }
}

// Kör funktionen när sidan laddas
fetchUserProfile();


async function fetchUserPosts() {
    const userId = getUserIdFromURL();
    if (!userId) {
        console.error("No user ID found in URL.");
        return;
    }

    try {
        const response = await fetch(`https://dummyjson.com/posts/user/${userId}`);
        const data = await response.json();

        console.log("User posts data:", data); // 🔴 Logga datan för felsökning

        if (!data.posts || data.posts.length === 0) {
            document.getElementById("user-posts").innerHTML = "<p class='error-message'>No posts found for this user.</p>";
            return;
        }

        // Hämta kommentarer för varje post
        const postsWithComments = await Promise.all(data.posts.map(async post => {
            const commentsResponse = await fetch(`https://dummyjson.com/comments/post/${post.id}`);
            const commentsData = await commentsResponse.json();
            
            return { 
                ...post, 
                comments: commentsData.comments 
            };
        }));

        displayUserPosts(postsWithComments);
    } catch (error) {
        console.error("Error fetching user posts:", error);
    }
}

// Kör funktionen när sidan laddas
fetchUserPosts();

function displayUserPosts(posts) {
    const userPosts = document.getElementById("user-posts");

    console.log("Displaying posts for user:", posts); // 🔴 Logga innan vi visar dem

    posts.forEach(post => {
        const postElement = document.createElement("article");
        postElement.classList.add("post");

        // Skapa en kommentarsektion
        const commentSection = document.createElement("div");
        commentSection.classList.add("comments-section");

        if (post.comments.length > 0) {
            commentSection.innerHTML = `<h3>Comments:</h3>`;
            post.comments.forEach(comment => {
                const commentElement = document.createElement("p");
                commentElement.classList.add("comment");
                commentElement.innerHTML = `<strong>${comment.user.username}:</strong> ${comment.body}`;
                commentSection.appendChild(commentElement);
            });
        } else {
            commentSection.innerHTML = `<p class="no-comments">No comments available.</p>`;
        }

        postElement.innerHTML = `
            <h2>${post.title}</h2>
            <p class="post-body">${post.body}</p>
            <p class="post-meta">Tags: ${post.tags?.join(", ") || "No tags"}</p>
            <p class="post-meta">👍 Likes: ${post.reactions?.likes || 0} | 👎 Dislikes: ${post.reactions?.dislikes || 0}</p>
        `;

        postElement.appendChild(commentSection);
        userPosts.appendChild(postElement); // Lägg till inlägg istället för att ersätta gamla
    });
}


