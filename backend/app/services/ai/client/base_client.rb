module Ai
  module Client
    class BaseClient
      def chat(prompt)
        raise NotImplementedError
      end
    end
  end
end