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
    commits: [],
    username: '',
    repoMessage: null,
    isRepoError: false,
    selectedRepo: null,
    commitMessage: null,
    isCommitError: false,
}

usernameInput.addEventListener('keyup', (e) => {
    state.username = e.target.value;
    UpdateState(state);
});

repoSelect.addEventListener('change', OnRepoSelected);
            

// Listen for clicks on the fetch repos button
fetchReposButton.addEventListener('click', FetchRepos);
showReposButton.addEventListener('click', ShowRepos);
loadCommitsButton.addEventListener('click', LoadCommits);

function OnRepoSelected(e){
    const selectedRepo = e.target.value;
    console.log("Selected repo:", selectedRepo);
    if (selectedRepo !== 'default') {
        state.selectedRepo = selectedRepo;
        loadCommitsButton.disabled = false;
        loadCommitsButton.addEventListener('click', LoadCommits);
    } else {
        loadCommitsButton.disabled = true;
    }
}

function LoadCommits(e){
    const selectedRepoName = e.target.value;
    console.log("Loading commits for repo:", selectedRepoName);   
    ShowCommits();
}

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
    state.username = usernameInput.value;
    state.commits = [];
    const ul = document.getElementById('userRepos');
    ul.innerHTML = '';
    console.log("Fetching commits for repo:", state.selectedRepo);
    try{
        let response = await fetch(`https://api.github.com/repos/${state.username}/${state.selectedRepo}/commits`);

        if(response.status == 403) {
            // forbidden, rate limit exceeded
            console.error('Rate limit exceeded. Please try again later.');
            state.isCommitError = true;
            state.commitMessage = 'Rate limit excedido. Tente novamente mais tarde.';
            UpdateState();
            return;
        }

        if(response.status == 404){
            console.error('Repo not found:', state.selectedRepo);
            state.isCommitError = true;
            state.commitMessage = 'Repositório não encontrado: ' + state.selectedRepo;
            UpdateState();
            return;
        }

        if(response.status != 200){
            console.error('Error fetching data:', response.statusText);
            state.isCommitError = true;
            state.commitMessage = 'Erro ' + response.statusText;
            UpdateState();
            return;
        }

        let data = await response.json();
        
        if(data.message === "Not Found"){
            state.isCommitError = true;
            state.commitMessage = 'Repositório não encontrado: ' + state.username;
            console.error('Repo not found, code 200:', state.username);
            UpdateState();
            return;
        }

        for (const commit of data) {
            state.commits.push(commit);
        }

        console.log("Commits fetched successfully:", state.commits);
        state.commitMessage = 'Buscado '+ state.commits.length + ' commits';
        state.isCommitError = false;
        UpdateState();

        for (const commit of state.commits) {
            const li = document.createElement('li');
            li.classList.add('list-group-item');
            li.innerHTML = `
                <p><strong>Hash:</strong> ${commit.sha}</p>
                <p><strong>Autor:</strong> ${commit.commit.author.name}</p>
                <p><strong>Data:</strong> ${commit.commit.author.date}</p>
                <p><strong>Mensagem:</strong> ${commit.commit.message}</p>
            `;
            ul.appendChild(li);
        }
        
        

    }catch(error){

    }
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
            state.repoMessage = 'Rate limit excedido. Tente novamente mais tarde.';
            UpdateState();
            return;
        }
        if(response.status == 404){
            console.error('User not found:', state.username);
            state.isRepoError = true;
            state.repoMessage = 'Usuário não encontrado: ' + state.username;
            UpdateState();
            return;
        }
        if(response.status != 200){
            console.error('Error fetching data:', response.statusText);
            state.isRepoError = true;
            state.repoMessage = 'Erro ' + response.statusText;
            UpdateState();
            return;
        }

        let data = await response.json();

        if(data.message === "Not Found"){
            state.isRepoError = true;
            state.repoMessage = 'Usuário não encontrado: ' + state.username;
            console.error('No account exists with username, code 200:', state.username);
            UpdateState();
            return;
        }
        for (const repo of data) {
            state.repos.push(repo);
        }
        console.log("Repos fetched successfully:", state.repos);
        state.isRepoError = false;
        state.repoMessage = 'Buscado '+ state.repos.length + ' repositórios';
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
            <p><strong>Nome:</strong> ${repo.name}</p>
            <p><strong>Descrição:</strong> ${repo.description || 'No description available'}</p>
            <p><strong>URL:</strong> <a href="${repo.html_url}">${repo.html_url}</a></p>
        `;
        ul.appendChild(li);
    }
}
