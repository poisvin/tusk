Rails.application.routes.draw do
  namespace :api do
    namespace :v1 do
      resources :tasks do
        resources :updates, controller: 'task_updates', only: [:index, :create, :destroy]
        resources :linked_notes, only: [:create, :destroy]
      end
      resources :tags, except: [:show]
      resources :notes
    end
  end

  # Health check
  get "up" => "rails/health#show", as: :rails_health_check
end
