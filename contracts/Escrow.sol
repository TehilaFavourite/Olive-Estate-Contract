// SPDX-License-Identifier: MIT

pragma solidity 0.8.9;

interface IERC721 {
    function transferFrom(
        address from,
        address to,
        uint256 tokenId
    ) external;

    function balanceOf(address owner) external view returns (uint256 balance);

    function tokenURI(uint256 tokenId) external view returns (string memory);

    function ownerOf(uint256 tokenId) external view returns (address owner);

}

error LowFee();
error appraisalFailed();
error inspectionFailed();
error buyerUnapproves();
error sellerUnapproves();
error incompleteFee();
error notBuyer();
error cancelledSale();


contract Escrow {
    IERC721 public OliveEstate;

    event ListedProperty
    (
        address indexed _seller, 
        string _uri, 
        uint256 _tokenId, 
        uint256 pptyFee, 
        uint256 _time, 
        bool _forSale
        );
    event BuyerDeposit
    (
        address indexed buyer, 
        address indexed inspector, 
        address indexed appraiser, 
        uint256 _tokenId, 
        uint256 value, 
        uint256 time
        );
    event AppraiserStatus
    (
        address indexed appraiser, 
        uint256 value, 
        uint256 tokenid, 
        uint256 time, 
        bool status
        );
    event InspectorStatus
    (
        address indexed Inspector, 
        uint256 value, 
        uint256 tokenid, 
        uint256 time, 
        bool status
        );
    event SellerApproval
    (
        address indexed _seller, 
        uint256 tokenid, 
        bool status, 
        uint256 time
        );
    event BuyerApproval
    (
        address indexed buyer, 
        uint256 tokenid, 
        bool status, 
        uint256 time
        );
    event BuyerCompleteFees
    (
        address indexed buyer, 
        uint256 value, 
        uint256 tokenid, 
        uint256 time
        );
    event CompleteTransaction
    (
        address indexed seller, 
        address indexed buyer,
        uint256 tokenID, 
        uint256 time
    );

    struct Property {
        address seller;
        address buyer;
        address appraiser;
        address inspector;
        string tokenUri;
        uint256 tokenID;
        uint256 propertyFee;
        uint256 buyerDeposit;
        
    }

    struct Set {
        bool isForSale;
        bool appraisal;
        bool inspection;
        bool buyerApprove;
        bool sellerApprove;
        bool cancelSales;
        uint256 completeFee;
        uint256 appFee;
        uint256 inspFee;
    }

    
    constructor(
        address _oliveNFT
    ) {
        OliveEstate = IERC721(_oliveNFT);
    }


    mapping(uint256 => Set) public set;
    mapping(uint256 => Property) public property;
    mapping(uint256 => mapping(address => uint256)) public appCheck;
    mapping(uint256 => mapping(address => uint256)) public inspCheck;

    
    function userNFTBal(address _addr) external view returns (uint256) {
        return OliveEstate.balanceOf(_addr);
    }

    function listedProperty(bool _forSale, uint256 _tokenID, uint256 _propertyFee) external  {
        Property storage _property = property[_tokenID];
        Set storage _set = set[_tokenID];
        require(OliveEstate.ownerOf(_tokenID) == msg.sender, "You do not own an NFT");
        require(_property.tokenID == 0, "property has been listed");
        _property.seller = msg.sender;
        _set.isForSale = _forSale;
        _property.propertyFee = _propertyFee;
        _property.tokenID = _tokenID;
        _property.tokenUri = OliveEstate.tokenURI(_tokenID);

        emit ListedProperty(msg.sender, _property.tokenUri, _tokenID, _propertyFee, block.timestamp, _forSale);
    }

    function buyerDeposit(address _appraiser, address _inspector, uint256 _tokenID) external payable {
        Property storage _property = property[_tokenID];
        Set storage _set = set[_tokenID];
        uint256 escrowFee = _property.propertyFee * 20 / 100;
        require(_set.isForSale == true, "property is not for sale");
        require(msg.value >= escrowFee, "Escrow fee not complete");
        _property.buyer = msg.sender;
        _property.appraiser = _appraiser;
        _property.inspector = _inspector;
        _property.tokenID = _tokenID;
        _property.buyerDeposit = msg.value;

        emit BuyerDeposit(msg.sender, _property.inspector, _property.appraiser, _tokenID, msg.value, block.timestamp);
    }

    function appraisalStatus(bool _appraisal, uint256 _tokenID) external {
        if (appCheck[_tokenID][msg.sender] == 0) {
            appCheck[_tokenID][msg.sender] = 1;
        } else {
            require(appCheck[_tokenID][msg.sender] == 0, "can oly appraise once");
        }
        Property storage _property = property[_tokenID];
        Set storage _set = set[_tokenID];
        uint256 appraisalFee = _property.propertyFee * 25 / 1000;
        require(_property.appraiser == msg.sender, "you are not the appraiser");
        _set.appraisal = _appraisal;
        payable(msg.sender).transfer(appraisalFee);
        _set.appFee = appraisalFee;

        emit AppraiserStatus(msg.sender, appraisalFee, _tokenID, block.timestamp, _appraisal);
    }

    function inspectorStatus(bool _inspection, uint256 _tokenID) external {
        if (inspCheck[_tokenID][msg.sender] == 0) {
            inspCheck[_tokenID][msg.sender] = 1;
        } else {
            require(inspCheck[_tokenID][msg.sender] == 0, "can oly appraise once");
        }
        Property storage _property = property[_tokenID];
        Set storage _set = set[_tokenID];
        uint256 inspectionFee = _property.propertyFee * 25 / 1000;
        require(_property.inspector == msg.sender, "you are not the inspector");
        _set.inspection = _inspection;
        payable(msg.sender).transfer(inspectionFee);
        _set.inspFee = inspectionFee;

        emit InspectorStatus(msg.sender, inspectionFee, _tokenID, block.timestamp, _inspection);
    }

    function sellerApproval(uint256 _tokenID, bool _seller) public {
        Property storage _property = property[_tokenID];
        Set storage _set = set[_tokenID];
        require(msg.sender == _property.seller, "you are not the seller");
        _property.tokenID = _tokenID;
        _set.sellerApprove = _seller;

        emit SellerApproval(msg.sender, _tokenID, _seller, block.timestamp);
    }

    function buyerApproval(uint256 _tokenID, bool _buyer ) public {
        Property storage _property = property[_tokenID];
        Set storage _set = set[_tokenID];
        require(msg.sender == _property.buyer, "you are not the buyer");
        _property.tokenID = _tokenID;
        _set.buyerApprove = _buyer;

        emit BuyerApproval(msg.sender, _tokenID, _buyer, block.timestamp);
    }

    function buyerCompleteFees(uint256 _tokenID) external payable {
        Property storage _property = property[_tokenID];
        Set storage _set = set[_tokenID];
        uint256 ptyFee = _property.propertyFee * 80/ 100;
        if(msg.value < ptyFee) revert LowFee();
        _property.buyer = msg.sender;
        _set.completeFee = ptyFee;

        emit BuyerCompleteFees(msg.sender, ptyFee, _tokenID, block.timestamp);
    } 

    function completeTransaction(uint256 _tokenID) external {
        Property storage _property = property[_tokenID];
        Set storage _set = set[_tokenID];
        uint256 sellerFee = _property.propertyFee * 80 / 100;
        if(!_set.appraisal) revert appraisalFailed();
        if(_set.inspection == false) revert inspectionFailed();
        if(!_set.sellerApprove) revert buyerUnapproves();
        if(!_set.buyerApprove) revert sellerUnapproves();
        if(!_set.cancelSales) revert cancelledSale();

        payable(_property.seller).transfer(sellerFee);
        IERC721(OliveEstate).transferFrom(_property.seller, _property.buyer, _property.tokenID);

        emit CompleteTransaction(_property.seller, _property.buyer, _tokenID, block.timestamp);
    }

    function cancelSale(uint256 _tokenID, bool _status) public {
        Property storage _property = property[_tokenID];
        Set storage _set = set[_tokenID];
        if (!_set.inspection || !_set.appraisal ) {
            payable(_property.buyer).transfer(address(this).balance);
            _set.cancelSales = _status;
        } else {
            payable(_property.seller).transfer(address(this).balance);
            _set.cancelSales = _status;
        }
    }

    

    function getEscrowBalance() external view returns (uint256) {
        return address(this).balance;
    }

    function getUserBalance(address _user) external view returns (uint256) {
        return address(_user).balance;
    }

       
}