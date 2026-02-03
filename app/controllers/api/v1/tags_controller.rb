module Api
  module V1
    class TagsController < ApplicationController
      def index
        tags = Tag.all.order(:name)
        render json: TagBlueprint.render(tags)
      end

      def create
        tag = Tag.new(tag_params)
        if tag.save
          render json: TagBlueprint.render(tag), status: :created
        else
          render json: { errors: tag.errors.full_messages }, status: :unprocessable_entity
        end
      end

      def update
        tag = Tag.find(params[:id])
        if tag.update(tag_params)
          render json: TagBlueprint.render(tag)
        else
          render json: { errors: tag.errors.full_messages }, status: :unprocessable_entity
        end
      end

      def destroy
        tag = Tag.find(params[:id])
        tag.destroy
        head :no_content
      end

      private

      def tag_params
        params.require(:tag).permit(:name, :color)
      end
    end
  end
end
