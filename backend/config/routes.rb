require 'sidekiq/web'

Rails.application.routes.draw do
  mount Sidekiq::Web => '/sidekiq'
  get "/health", to: "health#index"
  devise_for :users
  # Define your application routes per the DSL in https://guides.rubyonrails.org/routing.html

  # Reveal health status on /up that returns 200 if the app boots with no exceptions, otherwise 500.
  # Can be used by load balancers and uptime monitors to verify that the app is live.
  get "up" => "rails/health#show", as: :rails_health_check

  get '/auth/:provider/callback', to: 'auth#google'
  get '/auth/failure', to: redirect('/')

  resources :emails, only: [:index]
  post '/sync_emails', to: 'emails#sync'
  resources :tasks, only: [:update]

  # Defines the root path route ("/")
  # root "posts#index"
end
