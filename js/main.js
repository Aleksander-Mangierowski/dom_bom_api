let posts = [];
let instantSearchPosts = [];

fetch('https://api.myjson.com/bins/152f9j')
.then(response => response.json())
.then(json => {
    window.localStorage.setItem('isInstantSearch', 'false');
    posts = json.data;
    fillTagsSelect();
    loadAsideParameters();
    sortPosts();
    publicPosts();
});


const tags = new Set();

postsEl = document.getElementsByClassName('posts')[0];

const sortByDateBtn = document.querySelector('#sort_by_date>button');
const sortByDateSelect = document.querySelector('#sort_by_date>select');

const sortByTagsBtn = document.querySelector('#sort_by_tags>button');
const sortByTagsSelect = document.querySelector('#sort_by_tags>select');

const instantSearchInput = document.getElementById('instant-search');


function fillTagsSelect() {
    sortByTagsSelect.innerHTML = "";

    posts.forEach(post => {
      post.tags.forEach(tag => {
        tags.add(tag);
      });
    });

    [...tags].sort().forEach(tag => {
      const option = document.createElement("option");
      option.innerHTML = option.value = tag;
      sortByTagsSelect.appendChild(option);
    });
}

function loadAsideParameters() {

    if (!window.localStorage.getItem('sortBy')) return;

    if (window.localStorage.getItem('sortBy') == 'date') {

        sortByDateSelect.value = window.localStorage.getItem('isNewestFirst');
    } else {
        const tags = window.localStorage.getItem('tags').split(',');

        Array.prototype.forEach.call(sortByTagsSelect.options, option => {
            if (tags.includes(option.value)) {
                option.selected = true;
            }
        });
    }
}

function sortPosts() {
    const sortBy = window.localStorage.getItem('sortBy') ? window.localStorage.getItem('sortBy') : 'date';

    if (sortBy == 'date') {
        posts.sort(sortByDate);
    } else {
        posts.sort(sortByTags);
    }
}

function sortByDate(a, b) {
    const isNewestFirst = window.localStorage.getItem('isNewestFirst') ? window.localStorage.getItem('isNewestFirst') : 'true';

    return isNewestFirst == 'true' ? Date.parse(b.createdAt) - Date.parse(a.createdAt) : Date.parse(a.createdAt) - Date.parse(b.createdAt);
}

function sortByTags(a, b) {
    const tags = window.localStorage.getItem('tags').split(',');
    
    let countA = 0;
    let countB = 0;

    tags.forEach(tag => {
        if (a.tags.includes(tag)) countA++;

        if (b.tags.includes(tag)) countB++;
    })

    if (countA - countB != 0) return countB - countA;

    return Date.parse(b.createdAt) - Date.parse(a.createdAt);
}



function publicPosts(shouldPostListBeCleared = true, from = 0, to = 10) {

    if (shouldPostListBeCleared) {
        clearNode();
    }

    const allPosts = window.localStorage.getItem('isInstantSearch') == 'true' ? [...instantSearchPosts] : [...posts];

    const shownPosts = allPosts.slice(from, to);


    shownPosts.forEach(post => {

        const postElWrp = document.createElement('div');
        postElWrp.classList.add('col');

        const postEl = document.createElement('div');
        postEl.classList.add('post');
        postEl.innerHTML = `
            <div class="post-img">
                <img src=${post.image} alt=${post.title}>
            </div>
        `;

        const postBody = document.createElement('div');
        postBody.classList.add('post-body');

        postBody.innerHTML = `
            <div class="post-title">${post.title}</div>
            <div class="post-date">${(new Date(post.createdAt)).toLocaleString('en-Us', {day: 'numeric', month: 'short', year: 'numeric'})}</div>
            <div class="post-description">${post.description}</div>
        `;
                
        const postTags = document.createElement('div');
        postTags.classList.add('post-tags');

        const tagsText = document.createTextNode('Tags:');

        postTags.appendChild(tagsText);

        const tagsUl = document.createElement('ul');

        post.tags.forEach(tag => {

            const tagEl = document.createElement('li');
            tagEl.innerHTML = `
                <a href="#">${tag}</a>
            `;
            tagsUl.appendChild(tagEl);
        });

        postTags.appendChild(tagsUl);
        postBody.appendChild(postTags);

        const postBtns = document.createElement('div');
        postBtns.classList.add('post-btns');
        postBtns.innerHTML = `
            <button class="btn del-btn" type="button">Delete</button>
        `;

        postBody.appendChild(postBtns);
        postEl.appendChild(postBody);
        postElWrp.appendChild(postEl);
        postsEl.appendChild(postElWrp);

    });
}

function clearNode(node = postsEl, from = 0) {

    while (node.children.length > from) {
        node.removeChild(node.lastChild);
    }
}


//
// Event Listeners
//

// sorting

sortByDateBtn.addEventListener('click', evt => {
    
    window.localStorage.setItem('sortBy', sortByDateSelect.dataset.sort);
    window.localStorage.setItem('isNewestFirst', sortByDateSelect.value);
    window.localStorage.setItem('isInstantSearch', 'false');
    
    sortByTagsSelect.selectedIndex = -1;

    instantSearchInput.value = '';

    clearNode();

    sortPosts();

    publicPosts();
});


sortByTagsBtn.addEventListener('click', evt => {

    window.localStorage.setItem('sortBy', sortByTagsSelect.dataset.sort);
    window.localStorage.setItem('isInstantSearch', 'false');


    const tags = [];
    
    Array.prototype.forEach.call(sortByTagsSelect.options, option => {
        if (option.selected) {
            tags.push(option.value);
        }
    });

    window.localStorage.setItem('tags', tags.join());    

    sortByDateSelect.value = "true";

    instantSearchInput.value = '';

    clearNode();

    sortPosts();

    publicPosts();
});



// adding posts on the page bottom

function getDocHeight() {
    const D = document;
    return Math.max(
        D.body.scrollHeight, D.documentElement.scrollHeight,
        D.body.offsetHeight, D.documentElement.offsetHeight,
        D.body.clientHeight, D.documentElement.clientHeight
    );
}

const onlyTenPostsBtn = document.querySelector('.only-ten-posts-btn');

window.addEventListener('scroll', evt => {

    if (document.documentElement.clientHeight + window.pageYOffset == getDocHeight()) {
        
        const postsNumber = postsEl.children.length;
        
        publicPosts(false, postsNumber, postsNumber + 10);

        if (postsNumber == 10) {
            
            onlyTenPostsBtn.classList.add('active');
        }
    }
});

onlyTenPostsBtn.addEventListener('click', evt => {

    window.scrollTo({
        top: 0,
        // behavior: "smooth"
    });

    clearNode(undefined, 10);

    onlyTenPostsBtn.classList.remove('active');
});




// instant search

instantSearchInput.addEventListener('input', evt => {

    sortByDateSelect.value = "true";

    sortByTagsSelect.selectedIndex = -1;

    if (evt.target.value == '') {
        
        sortByDateBtn.click();

        return;        
    }

    window.localStorage.clear();
    window.localStorage.setItem('isInstantSearch', 'true');

    instantSearchPosts = posts.filter(post => post.title.includes(evt.target.value));

    instantSearchPosts.sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));

    clearNode();

    publicPosts();
});


// post deleting

postsEl.addEventListener('click', evt => {

    if (evt.target.classList.contains('del-btn')) {

        const node = evt.target.closest('.col');
        
        const postTitle = node.querySelector('.post-title').innerHTML;

        postsEl.removeChild(node);

        const index = posts.findIndex(post => post.title == postTitle);

        posts.splice(index, 1);
    }
});

