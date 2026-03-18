// js/app.js
// ================================================================
// SocialNet Manager · LBYCPG3 · Lab Activity 7
// ================================================================

// ================================================================
// Section 1: Supabase Client Initialization
// ================================================================
const { createClient } = supabase

// ⚠️ REPLACE with your actual Supabase credentials
const SUPABASE_URL             = 'https://xuaxsrcoaicivhhgvqcq.supabase.co'
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_PXJbWFW_U-DPzDwkq7rnjA_n8Y2h9gE'

const db = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY)

// ================================================================
// Section 2: Application State
// ================================================================
let currentProfileId = null
let currentProfileName = null

// Quick tip messages
const TIPS = [
  'Click any name in the profile list to view their details.',
  'Press Enter in the name field to quickly add a profile.',
  'The status bar at the bottom shows the result of every action.',
  'Press Enter in the status field to update it instantly.',
  'Friends are bidirectional — adding a friend connects both profiles.',
  'Use Search to jump directly to any profile by name.',
  'Profile pictures support any relative path: resources/images/name.png',
]

// ================================================================
// Section 3: Helper Functions
// ================================================================

function setStatus(message, type = 'info') {
  const bar     = document.getElementById('status-bar')
  const msg     = document.getElementById('status-message')
  const icon    = document.getElementById('status-icon')
  const timeEl  = document.getElementById('status-time')

  msg.textContent = message

  const now = new Date()
  timeEl.textContent = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })

  bar.classList.remove('status-error', 'status-success')

  if (type === 'error') {
    bar.classList.add('status-error')
    icon.innerHTML = '<i class="bi bi-exclamation-circle-fill"></i>'
  } else if (type === 'success') {
    bar.classList.add('status-success')
    icon.innerHTML = '<i class="bi bi-check-circle-fill"></i>'
  } else {
    icon.innerHTML = '<i class="bi bi-info-circle-fill"></i>'
  }

  if (type === 'error') {
    setTimeout(() => {
      bar.classList.remove('status-error')
      icon.innerHTML = '<i class="bi bi-info-circle-fill"></i>'
    }, 4000)
  }
}

function setTip(message) {
  const el = document.getElementById('tip-text')
  if (el) el.textContent = message
}

function clearCentrePanel() {
  document.getElementById('profile-pic').src         = 'resources/images/default.png'
  document.getElementById('profile-name').textContent = 'No Profile Selected'
  document.getElementById('profile-status').innerHTML  = '<i class="bi bi-circle-fill status-dot"></i> Select a profile'
  document.getElementById('profile-quote').textContent = 'Select a profile to see their favorite quote…'
  document.getElementById('friends-list').innerHTML    = '<p class="empty-state-text">No friends to display</p>'
  document.getElementById('friends-count').textContent = '0'
  currentProfileId   = null
  currentProfileName = null
}

function displayProfile(profile, friends = []) {
  const picEl = document.getElementById('profile-pic')
  picEl.src   = profile.picture || 'resources/images/default.png'
  picEl.onerror = () => {
    picEl.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(profile.name)}`
  }

  document.getElementById('profile-name').textContent = profile.name

  const statusEl = document.getElementById('profile-status')
  statusEl.innerHTML = `<i class="bi bi-circle-fill status-dot"></i> ${profile.status || '(no status)'}`

  document.getElementById('profile-quote').textContent = profile.quote || '(no quote set)'

  currentProfileId   = profile.id
  currentProfileName = profile.name

  renderFriendsList(friends)
  setStatus(`Now viewing: ${profile.name}`, 'success')
  setTip(`Editing profile for ${profile.name}. Use the fields above to update their info.`)
}

function renderFriendsList(friends) {
  const list    = document.getElementById('friends-list')
  const countEl = document.getElementById('friends-count')

  list.innerHTML   = ''
  countEl.textContent = friends.length

  if (friends.length === 0) {
    list.innerHTML = '<p class="empty-state-text"><i class="bi bi-person-x" style="font-size:1.2rem;display:block;margin-bottom:4px;"></i>No connections yet</p>'
    return
  }

  friends.forEach((f, i) => {
    const div       = document.createElement('div')
    div.className   = 'friend-entry'
    div.style.animationDelay = `${i * 30}ms`
    div.textContent = f.name
    list.appendChild(div)
  })
}

// ================================================================
// Section 4: CRUD Functions
// ================================================================

async function loadProfileList() {
  const container = document.getElementById('profile-list')
  container.innerHTML = '<div class="loading-state"><div class="spinner"></div><p>Loading…</p></div>'

  try {
    const { data, error } = await db
      .from('profiles')
      .select('id, name, picture')
      .order('name', { ascending: true })

    if (error) throw error

    const countEl = document.getElementById('profile-count')
    countEl.textContent = data.length

    container.innerHTML = ''

    if (data.length === 0) {
      container.innerHTML = '<p class="empty-state-text">No profiles yet.<br>Add one above!</p>'
      return
    }

    data.forEach((profile, i) => {
      const row       = document.createElement('div')
      row.className   = 'profile-item'
      row.dataset.id  = profile.id
      row.style.animationDelay = `${i * 20}ms`

      const avatar    = document.createElement('img')
      avatar.className = 'list-avatar'
      avatar.src      = profile.picture || 'resources/images/default.png'
      avatar.alt      = profile.name
      avatar.onerror  = () => {
        avatar.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(profile.name)}`
      }

      const nameSpan  = document.createElement('span')
      nameSpan.className = 'list-name'
      nameSpan.textContent = profile.name

      row.appendChild(avatar)
      row.appendChild(nameSpan)

      row.addEventListener('click', () => selectProfile(profile.id))

      container.appendChild(row)
    })

  } catch (err) {
    container.innerHTML = '<p class="empty-state-text" style="color:var(--accent-rose)">Failed to load profiles.</p>'
    setStatus(`Error loading profiles: ${err.message}`, 'error')
  }
}

async function selectProfile(profileId) {
  document.querySelectorAll('#profile-list .profile-item').forEach(el => {
    el.classList.toggle('active', el.dataset.id === profileId)
  })

  try {
    const { data: profile, error: profileError } = await db
      .from('profiles')
      .select('*')
      .eq('id', profileId)
      .single()

    if (profileError) throw profileError

    const { data: friendRows, error: friendsError } = await db
      .from('friends')
      .select('profile_id, friend_id')
      .or(`profile_id.eq.${profileId},friend_id.eq.${profileId}`)

    if (friendsError) throw friendsError

    const friendIds = friendRows.map(row =>
      row.profile_id === profileId ? row.friend_id : row.profile_id
    )

    let friendObjects = []

    if (friendIds.length > 0) {
      const { data: friendProfiles, error: fpError } = await db
        .from('profiles')
        .select('id, name')
        .in('id', friendIds)
        .order('name', { ascending: true })

      if (fpError) throw fpError
      friendObjects = friendProfiles
    }

    displayProfile(profile, friendObjects)

  } catch (err) {
    setStatus(`Error selecting profile: ${err.message}`, 'error')
  }
}

async function addProfile() {
  const nameInput = document.getElementById('input-name')
  const name      = nameInput.value.trim()

  if (!name) {
    setStatus('Error: Name field is empty. Please enter a full name.', 'error')
    nameInput.focus()
    return
  }

  try {
    const { data, error } = await db
      .from('profiles')
      .insert({ name })
      .select()
      .single()

    if (error) {
      if (error.code === '23505') {
        setStatus(`Error: A profile named "${name}" already exists.`, 'error')
      } else {
        throw error
      }
      return
    }

    nameInput.value = ''
    await loadProfileList()
    await selectProfile(data.id)
    setStatus(`Profile "${name}" created successfully!`, 'success')

  } catch (err) {
    setStatus(`Error adding profile: ${err.message}`, 'error')
  }
}

async function lookUpProfile() {
  const query = document.getElementById('input-lookup').value.trim()

  if (!query) {
    setStatus('Error: Search field is empty.', 'error')
    return
  }

  try {
    const { data, error } = await db
      .from('profiles')
      .select('id, name')
      .ilike('name', `%${query}%`)
      .order('name', { ascending: true })
      .limit(1)

    if (error) throw error

    if (data.length === 0) {
      setStatus(`No profile found matching "${query}".`, 'error')
      clearCentrePanel()
      return
    }

    await selectProfile(data[0].id)

  } catch (err) {
    setStatus(`Error looking up profile: ${err.message}`, 'error')
  }
}

async function deleteProfile() {
  if (!currentProfileId) {
    setStatus('Error: No profile is selected. Click a profile in the list first.', 'error')
    return
  }

  const name = currentProfileName

  if (!window.confirm(`Delete the profile for "${name}"? This cannot be undone.`)) {
    setStatus('Deletion cancelled.')
    return
  }

  try {
    const { error } = await db
      .from('profiles')
      .delete()
      .eq('id', currentProfileId)

    if (error) throw error

    clearCentrePanel()
    await loadProfileList()
    setStatus(`Profile "${name}" deleted. Friend relationships removed automatically.`, 'success')

  } catch (err) {
    setStatus(`Error deleting profile: ${err.message}`, 'error')
  }
}

async function changeStatus() {
  if (!currentProfileId) {
    setStatus('Error: No profile is selected.', 'error')
    return
  }

  const newStatus = document.getElementById('input-status').value.trim()

  if (!newStatus) {
    setStatus('Error: Status field is empty.', 'error')
    return
  }

  try {
    const { error } = await db
      .from('profiles')
      .update({ status: newStatus })
      .eq('id', currentProfileId)

    if (error) throw error

    const statusEl = document.getElementById('profile-status')
    statusEl.innerHTML = `<i class="bi bi-circle-fill status-dot"></i> ${newStatus}`
    document.getElementById('input-status').value = ''
    setStatus(`Status updated for ${currentProfileName}.`, 'success')

  } catch (err) {
    setStatus(`Error updating status: ${err.message}`, 'error')
  }
}

async function changePicture() {
  if (!currentProfileId) {
    setStatus('Error: No profile is selected.', 'error')
    return
  }

  const filePathInput = document.getElementById('input-picture-file')
  const urlInput      = document.getElementById('input-picture')
  const filePath      = filePathInput.value.trim()
  const urlValue      = urlInput.value.trim()

  // URL takes priority; fall back to file path
  const newPicture = urlValue || filePath

  if (!newPicture) {
    setStatus('Error: Please enter a file path or paste an image URL.', 'error')
    return
  }

  try {
    const { error } = await db
      .from('profiles')
      .update({ picture: newPicture })
      .eq('id', currentProfileId)

    if (error) throw error

    document.getElementById('profile-pic').src = newPicture
    filePathInput.value = ''
    urlInput.value      = ''
    setStatus(`Profile picture updated for ${currentProfileName}.`, 'success')

    const listItem = document.querySelector(`#profile-list .profile-item[data-id="${currentProfileId}"] .list-avatar`)
    if (listItem) listItem.src = newPicture

  } catch (err) {
    setStatus(`Error updating picture: ${err.message}`, 'error')
  }
}
async function changeQuote() {
  if (!currentProfileId) {
    setStatus('Error: No profile is selected.', 'error')
    return
  }

  const newQuote = document.getElementById('input-quote').value.trim()

  if (!newQuote) {
    setStatus('Error: Quote field is empty.', 'error')
    return
  }

  try {
    const { error } = await db
      .from('profiles')
      .update({ quote: newQuote })
      .eq('id', currentProfileId)

    if (error) throw error

    document.getElementById('profile-quote').textContent = newQuote
    document.getElementById('input-quote').value = ''
    setStatus(`Quote updated for ${currentProfileName}.`, 'success')

  } catch (err) {
    setStatus(`Error updating quote: ${err.message}`, 'error')
  }
}

// ================================================================
// Section 5: Friends Management
// ================================================================

async function addFriend() {
  if (!currentProfileId) {
    setStatus('Error: No profile is selected.', 'error')
    return
  }

  const friendName = document.getElementById('input-friend-add').value.trim()

  if (!friendName) {
    setStatus('Error: Friend name field is empty.', 'error')
    return
  }

  try {
    const { data: found, error: findError } = await db
      .from('profiles')
      .select('id, name')
      .ilike('name', friendName)
      .limit(1)

    if (findError) throw findError

    if (found.length === 0) {
      setStatus(`Error: No profile named "${friendName}" exists. Add that profile first.`, 'error')
      return
    }

    const friendId = found[0].id

    if (friendId === currentProfileId) {
      setStatus('Error: A profile cannot be friends with itself.', 'error')
      return
    }

    const profileIdA = currentProfileId < friendId ? currentProfileId : friendId
    const profileIdB = currentProfileId < friendId ? friendId : currentProfileId

    const { error: insertError } = await db
      .from('friends')
      .insert({ profile_id: profileIdA, friend_id: profileIdB })

    if (insertError) {
      if (insertError.code === '23505') {
        setStatus(`"${found[0].name}" is already in the friends list.`, 'error')
      } else {
        throw insertError
      }
      return
    }

    document.getElementById('input-friend-add').value = ''
    await selectProfile(currentProfileId)
    setStatus(`"${found[0].name}" added as a friend!`, 'success')

  } catch (err) {
    setStatus(`Error adding friend: ${err.message}`, 'error')
  }
}

async function removeFriend() {
  if (!currentProfileId) {
    setStatus('Error: No profile is selected.', 'error')
    return
  }

  const friendName = document.getElementById('input-friend-remove').value.trim()

  if (!friendName) {
    setStatus('Error: Friend name field is empty.', 'error')
    return
  }

  try {
    const { data: found, error: findError } = await db
      .from('profiles')
      .select('id, name')
      .ilike('name', friendName)
      .limit(1)

    if (findError) throw findError

    if (found.length === 0) {
      setStatus(`Error: No profile named "${friendName}" exists.`, 'error')
      return
    }

    const friendId = found[0].id

    const profileIdA = currentProfileId < friendId ? currentProfileId : friendId
    const profileIdB = currentProfileId < friendId ? friendId : currentProfileId

    const { error: deleteError } = await db
      .from('friends')
      .delete()
      .eq('profile_id', profileIdA)
      .eq('friend_id', profileIdB)

    if (deleteError) throw deleteError

    document.getElementById('input-friend-remove').value = ''
    await selectProfile(currentProfileId)
    setStatus(`"${found[0].name}" removed from friends list.`, 'success')

  } catch (err) {
    setStatus(`Error removing friend: ${err.message}`, 'error')
  }
}

// ================================================================
// Section 6: Event Listener Setup
// ================================================================
document.addEventListener('DOMContentLoaded', async () => {

  // ── Left panel ──
  document.getElementById('btn-add')
    .addEventListener('click', addProfile)

  document.getElementById('btn-lookup')
    .addEventListener('click', lookUpProfile)

  document.getElementById('btn-delete')
    .addEventListener('click', deleteProfile)

  // ── Right panel ──
  document.getElementById('btn-status')
    .addEventListener('click', changeStatus)

  document.getElementById('btn-picture')
    .addEventListener('click', changePicture)

  document.getElementById('btn-quote')
    .addEventListener('click', changeQuote)

  document.getElementById('btn-add-friend')
    .addEventListener('click', addFriend)

  document.getElementById('btn-remove-friend')
    .addEventListener('click', removeFriend)

  // UPDATED: ── Exit Button ──
  document.getElementById('btn-exit')
    .addEventListener('click', () => {
      if (!window.close()) setStatus('To exit, close this browser tab.', 'error')
    })

  // ── Enter key shortcuts ──
  document.getElementById('input-name')
    .addEventListener('keydown', e => { if (e.key === 'Enter') addProfile() })

  document.getElementById('input-lookup')
    .addEventListener('keydown', e => { if (e.key === 'Enter') lookUpProfile() })

  document.getElementById('input-status')
    .addEventListener('keydown', e => { if (e.key === 'Enter') changeStatus() })

  document.getElementById('input-quote')
    .addEventListener('keydown', e => { if (e.key === 'Enter') changeQuote() })

  document.getElementById('input-friend-add')
    .addEventListener('keydown', e => { if (e.key === 'Enter') addFriend() })

  document.getElementById('input-friend-remove')
    .addEventListener('keydown', e => { if (e.key === 'Enter') removeFriend() })

 
  let tipIndex = 0
  setInterval(() => {
    if (!currentProfileId) {
      tipIndex = (tipIndex + 1) % TIPS.length
      setTip(TIPS[tipIndex])
    }
  }, 8000)

  // ── Initial data load ──
  await loadProfileList()
  setStatus('Ready · Select a profile from the list or add a new one.')
})