import { createRouter, createWebHashHistory } from 'vue-router'
import ListView      from '../views/ListView.vue'
import SeedForm      from '../views/SeedForm.vue'
import SeedDetail    from '../views/SeedDetail.vue'
import TagsView      from '../views/TagsView.vue'
import PersonsView   from '../views/PersonsView.vue'
import CompaniesView from '../views/CompaniesView.vue'
import SettingsView  from '../views/SettingsView.vue'

const routes = [
  { path: '/',           name: 'list',      component: ListView },
  { path: '/new',        name: 'new',       component: SeedForm },
  { path: '/edit/:id',   name: 'edit',      component: SeedForm,      props: true },
  { path: '/seed/:id',   name: 'detail',    component: SeedDetail,    props: true },
  { path: '/tags',       name: 'tags',      component: TagsView },
  { path: '/persons',    name: 'persons',   component: PersonsView },
  { path: '/companies',  name: 'companies', component: CompaniesView },
  { path: '/settings',   name: 'settings',  component: SettingsView },
]

export default createRouter({
  history: createWebHashHistory(),
  routes,
  scrollBehavior: () => ({ top: 0 })
})
