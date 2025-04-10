const usernameInput = document.getElementById('usernameInput');
const fetchReposButton = document.getElementById('fetchReposButton');
const showReposButton = document.getElementById('showReposButton');
const statusRepoMessage = document.getElementById('statusRepoMessage');
const repoCard = document.getElementById('repoCard');
const repoSelect = document.getElementById('repoSelect');
const loadCommitsButton = document.getElementById('loadCommitsButton');

showReposButton.disabled = true;
fetchReposButton.disabled = true;
loadCommitsButton.disabled = true;

let state = {
    repos: [],
    username: '',
    repoMessage: null,
    isRepoError: false,
    selectedRepo: null,
}

usernameInput.addEventListener('keyup', (e) => {
    state.username = e.target.value;
    UpdateState(state);
});

repoSelect.addEventListener('change', (e) => {
    const selectedRepo = e.target.value;
    console.log("Selected repo:", selectedRepo);
    if (selectedRepo !== 'default') {
        state.selectedRepo = selectedRepo;
        loadCommitsButton.disabled = false;
        loadCommitsButton.addEventListener('click', () => {
            const selectedRepoName = e.target.value;
            console.log("Loading commits for repo:", selectedRepoName);   
            ShowCommits();
        }
        );
    } else {
        loadCommitsButton.disabled = true;
    }
});
            

// Listen for clicks on the fetch repos button
fetchReposButton.addEventListener('click', FetchRepos);
showReposButton.addEventListener('click', ShowRepos);

function UpdateState(){
    showReposButton.disabled = state.repos.length === 0 || !state.username;
    fetchReposButton.disabled = state.username === '' || !state.username;

    if(state.repoMessage == null){
        statusRepoMessage.classList.remove('text-success');
        statusRepoMessage.classList.remove('text-error');
        statusRepoMessage.classList.add('text-hidden');
    }
    statusRepoMessage.innerHTML = state.repoMessage || '';
    if(state.isRepoError){
        statusRepoMessage.classList.remove('text-success');
        statusRepoMessage.classList.add('text-error');
        statusRepoMessage.classList.remove('text-hidden');
    }else{
        statusRepoMessage.classList.remove('text-error');
        statusRepoMessage.classList.add('text-success');
        statusRepoMessage.classList.remove('text-hidden');
    }

    console.log("Updating state:", state.repos.length);
    if(state.repos.length == 0){
        repoCard.classList.add('text-hidden');

    }else{
        repoCard.classList.remove('text-hidden');
    }

    // limpa os repos no select
    // primeiro salva a opcao default
    const defaultOption = repoSelect.querySelector('option[value="default"]');

    repoSelect.innerHTML = '';
    // adiciona os repos no select
    repoSelect.appendChild(defaultOption);
    for (const repo of state.repos) {
        const option = document.createElement('option');
        option.value = repo.name;
        option.textContent = repo.name;
        repoSelect.appendChild(option);
    }
}

async function ShowCommits(){

}

async function FetchRepos(){
    state.username = usernameInput.value;
    console.log("Fetching repos for user:", state.username);
    try{
        let response = await fetch(`https://api.github.com/users/${state.username}/repos`);

        const ul = document.getElementById('userRepos');
        ul.innerHTML = '';
        state.repos = [];
        if(response.status == 403) {
            // forbidden, rate limit exceeded
            console.error('Rate limit exceeded. Please try again later.');
            state.isRepoError = true;
            state.repoMessage = 'Rate limit exceeded. Please try again later.';
            UpdateState();
            return;
        }
        if(response.status == 404){
            console.error('User not found:', state.username);
            state.isRepoError = true;
            state.repoMessage = 'User not found: ' + state.username;
            UpdateState();
            return;
        }
        if(response.status != 200){
            console.error('Error fetching data:', response.statusText);
            state.isRepoError = true;
            state.repoMessage = 'Error ' + response.statusText;
            UpdateState();
            return;
        }

        let data = await response.json();

        if(data.message === "Not Found"){
            state.isRepoError = true;
            state.repoMessage = 'No account exists with username: ' + state.username;
            console.error('No account exists with username:', state.username);
            UpdateState();
            return;
        }
        for (const repo of data) {
            state.repos.push(repo);
        }
        console.log("Repos fetched successfully:", state.repos);
        state.isRepoError = false;
        state.repoMessage = 'Fetched '+ state.repos.length + ' repos';
        UpdateState();
    }catch(error){  
        console.error('Error fetching data:', error);
        alert('Erro 3. '+error.message);
    }

}

function ShowRepos(){
    console.log("Showing repos for user:", state.username);
    
    const ul = document.getElementById('userRepos');
    ul.innerHTML = ''; // Clear previous results

    for (const repo of state.repos) {
        const li = document.createElement('li');
        li.classList.add('list-group-item');
        li.innerHTML = `
            <p><strong>Repo:</strong> ${repo.name}</p>
            <p><strong>Description:</strong> ${repo.description || 'No description available'}</p>
            <p><strong>URL:</strong> <a href="${repo.html_url}">${repo.html_url}</a></p>
        `;
        ul.appendChild(li);
    }
}

// // Get the GitHub username input form

// // Listen for submissions on GitHub username input form
// gitHubForm.addEventListener('submit', (e: Event) => {
//     // Prevent default form submission action
//     e.preventDefault();

//     // Get the GitHub username input field on the DOM
//     const usernameInput = document.getElementById('usernameInput') as HTMLInputElement;

//     // Get the value of the GitHub username input field
//     const gitHubUsername = usernameInput.value;

//     // Run GitHub API function, passing in the GitHub username
//     requestUserRepos(gitHubUsername)
//         .then(response => response.json()) // parse response into json
//         .then(data => {
//             const ul = document.getElementById('userRepos') as HTMLUListElement;
//             ul.innerHTML = ''; // Clear previous results

//             if (data.message === "Not Found") {
//                 const li = document.createElement('li');
//                 li.classList.add('list-group-item');
//                 li.innerHTML = `<p><strong>No account exists with username:</strong> ${gitHubUsername}</p>`;
//                 ul.appendChild(li);
//             } else {
//                 for (const repo of data) {
//                     const li = document.createElement('li');
//                     li.classList.add('list-group-item');
//                     li.innerHTML = `
//                         <p><strong>Repo:</strong> ${repo.name}</p>
//                         <p><strong>Description:</strong> ${repo.description || 'No description available'}</p>
//                         <p><strong>URL:</strong> <a href="${repo.html_url}">${repo.html_url}</a></p>
//                     `;
//                     ul.appendChild(li);
//                 }
//             }
//         })
//         .catch(error => {
//             console.error('Error fetching data:', error);
//         });
// });

// function requestUserRepos(username: string): Promise<Response> {
//     return fetch(`https://api.github.com/users/${username}/repos`);
// }
