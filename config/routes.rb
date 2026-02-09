Rails.application.routes.draw do
  # Web routes (new Stimulus/Turbo views)
  root "tasks#index"

  resources :tasks do
    member do
      post :toggle_status
    end
    resources :updates, controller: 'task_updates', only: [:create, :destroy]
    resources :linked_notes, only: [:create, :destroy]
  end

  resources :notes
  resource :calendar, only: [:show], controller: 'calendar'
  resource :dashboard, only: [:show], controller: 'dashboard'
  resource :settings, only: [:show, :update], controller: 'settings'
  resources :tags, only: [:index, :create, :update, :destroy]

  # API routes (for backward compatibility with any remaining API calls)
  namespace :api do
    namespace :v1 do
      resources :tasks do
        resources :updates, controller: 'task_updates', only: [:index, :create, :destroy]
        resources :linked_notes, only: [:create, :destroy]
      end
      resources :tags, except: [:show]
      resources :notes do
        delete 'attachments/:attachment_id', to: 'notes#destroy_attachment', on: :member
      end
      get 'stats/dashboard', to: 'stats#dashboard'
    end
  end

  # Health check
  get "up" => "rails/health#show", as: :rails_health_check
end
