require 'rails_helper'

RSpec.describe XlsxHelper, type: :lib do

  context '#sanitized_worksheet_name' do
    let(:helper) { described_class.new }

    it 'objects if no name provided' do
      expect{helper.sanitized_worksheet_name(name: nil)}.to raise_error(IllegalArgument)
    end

    it 'returns short names verbatim' do
      expect(helper.sanitized_worksheet_name(name: "Short name")).to eq "Short name"
    end

    it 'returns short names with suffixes with no truncation' do
      expect(helper.sanitized_worksheet_name(name: "Short name", suffix:"WOW")).to eq "Short nameWOW"
    end

    it 'replaces bad chars' do
      expect(helper.sanitized_worksheet_name(name: 'T:][\\/', suffix: '*?b:b')).to eq 'T-------b-b'
    end

    it 'leaves max length names alone' do
      expect(helper.sanitized_worksheet_name(name: '1234567890123456789012345678901')).to eq '1234567890123456789012345678901'
    end

    it 'truncates & numbers overlong names and resulting length is good' do
      expect(helper.sanitized_worksheet_name(name: '12345678901234567890123456789012')).to eq '1234567890123456789012345678-01'
    end

    it 'increments numbers for truncated names' do
      expect(helper.sanitized_worksheet_name(name: '12345678901234567890123456789012')).to eq '1234567890123456789012345678-01'
      expect(helper.sanitized_worksheet_name(name: "Short name")).to eq "Short name"
      expect(helper.sanitized_worksheet_name(name: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa')).to eq 'aaaaaaaaaaaaaaaaaaaaaaaaaaaa-02'
    end

    it 'maintains full length suffixes when truncating' do
      expect(helper.sanitized_worksheet_name(name: '12345678901234567890123456789012', suffix: 'howdy')).to eq '12345678901234567890123-01howdy'
    end

    it 'objects if suffix too long' do
      expect{helper.sanitized_worksheet_name(name: '12345', suffix: '1234567890123456789012345678')}.to raise_error(IllegalArgument)
    end

    it 'does not object if suffix is max length' do
      expect{helper.sanitized_worksheet_name(name: '12345', suffix: '123456789012345678901234567')}.not_to raise_error
    end
  end

end
