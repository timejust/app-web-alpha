TimejustApi::Application.routes.draw do

  # The priority is based upon order of creation:
  # first created -> highest priority.

  # Sample of regular route:
  #   match 'products/:id' => 'catalog#view'
  # Keep in mind you can assign values other than :controller and :action

  # Sample of named route:
  #   match 'products/:id/purchase' => 'catalog#purchase', :as => :purchase
  # This route can be invoked with purchase_url(:id => product.id)

  # Sample resource route (maps HTTP verbs to controller actions automatically):
  #   resources :products

  # Sample resource route with options:
  #   resources :products do
  #     member do
  #       get 'short'
  #       post 'toggle'
  #     end
  #
  #     collection do
  #       get 'sold'
  #     end
  #   end

  # Sample resource route with sub-resources:
  #   resources :products do
  #     resources :comments, :sales
  #     resource :seller
  #   end

  # Sample resource route with more complex sub-resources
  #   resources :products do
  #     resources :comments
  #     resources :sales do
  #       get 'recent', :on => :collection
  #     end
  #   end

  # Sample resource route within a namespace:
  #   namespace :admin do
  #     # Directs /admin/products/* to Admin::ProductsController
  #     # (app/controllers/admin/products_controller.rb)
  #     resources :products
  #   end

  # You can have the root of your site routed with "root"
  # just remember to delete public/index.html.
  # root :to => 'welcome#index'

  # See how all your routes lay out with "rake routes"

  # This is a legacy wild controller route that's not recommended for RESTful applications.
  # Note: This route will make all actions in every controller accessible via GET requests.
  # match ':controller(/:action(/:id(.:format)))'

  constraints(Subdomain) do
    root :to => 'api/version#show', :as => :api_root
    scope ':version', :as => 'api', :defaults => {:version => 'v1'}, :module => :api do
      resources :events, :only => [:create] do
        member do
          get :travel_nodes
          post :travel_nodes_confirmation
          get :travels
          put :cancel
          put :add_google_info
          post :write_travels_to_calendar
          get :around
        end
        collection do
          get :status_for_user
        end
      end
      resources :travels, :only => [:destroy] do
        member do
          put :confirm
          put :bookmark
        end
      end
      resources :travel_steps, :only => [:destroy] do
        member do
          put :confirm
          put :bookmark
        end
      end
      resources :users, :only => [] do
        collection do
          get :status
          put :purge_travels
          get :alias
          post :add_alias
          post :delete_alias
        end
      end
    end
  end

  root :to => "home#index"

  match 'gadget/timejust', :to => "gadget#show"

  devise_for :users, :controllers => { :omniauth_callbacks => "users/omniauth_callbacks" }

  match '/oauth2/callback', :to => 'users/oauth2#callback', :as => :oauth2_callback
  match '/oauth2/authorize', :to => 'users/oauth2#authorize', :as => :oauth2_authorize
  match '/oauth2/failure', :to => 'users/oauth2#failure', :as => :oauth2_failure

  # resque
  match "/resque", :to => Resque::Server, :anchor => false
end
