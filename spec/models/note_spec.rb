require 'rails_helper'

RSpec.describe Note, type: :model do
  describe 'validations' do
    it { should validate_presence_of(:title) }
  end

  describe 'enums' do
    it { should define_enum_for(:category).with_values(personal: 0, work: 1, ideas: 2) }
  end

  describe 'associations' do
    it { should have_and_belong_to_many(:tags) }
  end
end
