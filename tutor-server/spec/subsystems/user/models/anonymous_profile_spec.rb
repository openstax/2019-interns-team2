require 'rails_helper'

RSpec.describe User::Models::AnonymousProfile, type: :model do
  subject(:anon) { described_class.instance }

  it 'uses an anonymous account' do
    expect(anon.account).to be_kind_of(OpenStax::Accounts::AnonymousAccount)
  end

  it 'has no account id' do
    expect(anon.account_id).to be_nil
  end
end
