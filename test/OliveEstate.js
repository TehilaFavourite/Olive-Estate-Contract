const { expect } = require("chai");
const { ethers } = require("hardhat");  

const tokens = (n) => {
    return ethers.utils.parseUnits(n.toString(), 'ether')
  }
  const ether = tokens

describe('OliveEstate', () => {
  let oliveEstate, escrow
  let owner, seller, buyer, appraiser, inspector
  let property, setProperty, appCheck
  let balance, transaction
  let tokenID = 1
  let approve = true
  let unApprove = false
  let propertyFee = ether(100)
  let escrowFee = ether(20)
  let completionFee = ether(80)
  // let appraisalFee

  beforeEach(async () => {
    [owner, seller, buyer, appraiser, inspector] = await ethers.getSigners();
    

    const OliveEstate = await ethers.getContractFactory('OliveEstate')
    const Escrow = await ethers.getContractFactory('Escrow')

    oliveEstate = await OliveEstate.deploy()
    escrow = await Escrow.deploy(oliveEstate.address)

    

  })

  describe('Deployment', async () => {
    it('mints an NFT to the seller', async () => {
      await oliveEstate.connect(seller).safeMint(seller.address, tokenID, 'uri')
      expect(await oliveEstate.ownerOf(tokenID)).to.equal(seller.address)
    })
  })

  describe('Listing property', async () => {
    it('allows seller to list the property for sale', async () => {
      await oliveEstate.connect(seller).safeMint(seller.address, tokenID, 'uri')
      expect(await oliveEstate.ownerOf(tokenID)).to.equal(seller.address)
      await escrow.connect(seller).listedProperty(approve, tokenID, propertyFee)
      console.log('the property has been listed')

      property = await escrow.property(tokenID)
      setProperty = await escrow.set(tokenID)
      console.log('Property fee is :', property.propertyFee.toString(), ', the token ID is :', property.tokenID.toString(), ', is property for sale : ', setProperty.isForSale)
      
    })
  })

  describe('sales process', async () => {
    it('buyer makes escrow deposit', async () => {
      await oliveEstate.connect(seller).safeMint(seller.address, tokenID, 'uri')
      expect(await oliveEstate.ownerOf(tokenID)).to.equal(seller.address)
      await escrow.connect(seller).listedProperty(approve, tokenID, propertyFee)
      console.log('the property has been listed')

      console.log('buyer makes deposit and sets appraiser and inspector')
      await escrow.connect(buyer).buyerDeposit(appraiser.address, inspector.address, tokenID, {value:escrowFee})
      property = await escrow.property(tokenID)
      setProperty = await escrow.set(tokenID)
      console.log('the appraiser address is :', property.appraiser, 'the inspector address is:', property.inspector, 'tokenID :', tokenID, ', escroe fee :', escrowFee.toString() )
      balance = await escrow.getEscrowBalance()
      console.log("current contract balance is:", ethers.utils.formatEther(balance))
      expect(await escrow.getEscrowBalance()).to.equal(balance);
    })

    it('appraisal and inspector approves sale', async () => {

      balance = await escrow.getEscrowBalance()
      console.log("initial escrow balance is:", ethers.utils.formatEther(balance))

      const yourFirstfee = await escrow.getUserBalance(appraiser.address);
      console.log("before claim start appraisal: ", yourFirstfee.toString())

      await oliveEstate.connect(seller).safeMint(seller.address, tokenID, 'uri')
      expect(await oliveEstate.ownerOf(tokenID)).to.equal(seller.address)
      await escrow.connect(seller).listedProperty(approve, tokenID, propertyFee)
      console.log('the property has been listed')

      console.log('buyer makes deposit and sets appraiser and inspector')
      await escrow.connect(buyer).buyerDeposit(appraiser.address, inspector.address, tokenID, {value:escrowFee})
      balance = await escrow.getEscrowBalance()
      console.log("current contract balance is:", ethers.utils.formatEther(balance))
      expect(await escrow.getEscrowBalance()).to.equal(balance);

      console.log('appraisal updates status')
      await escrow.connect(appraiser).appraisalStatus(approve, tokenID)
      await expect(escrow.connect(appraiser).appraisalStatus(approve, tokenID)).to.be.revertedWith(
        "can oly appraise once"
      );
      console.log('status :', approve, ', tokenID :', tokenID)
      const appraisalfee = await escrow.getUserBalance(appraiser.address);
      console.log("Appraisal new fee", appraisalfee.toString())

      balance = await escrow.getEscrowBalance()
      console.log("initial escrow balance is:", ethers.utils.formatEther(balance))

      console.log('inspector updates status')
      await escrow.connect(inspector).inspectorStatus(approve, tokenID)
      await expect(escrow.connect(inspector).inspectorStatus(approve, tokenID)).to.be.revertedWith(
        "can oly appraise once"
      );
      console.log('status :', approve, ', tokenID :', tokenID)
      const inspecionFee = await escrow.getUserBalance(inspector.address);
      console.log("Inspection new fee", inspecionFee.toString())

      balance = await escrow.getEscrowBalance()
      console.log("initial escrow balance is:", ethers.utils.formatEther(balance))


    })

    it('buyer and seller approves', async () => {


      balance = await escrow.getEscrowBalance()
      console.log("initial escrow balance is:", ethers.utils.formatEther(balance))

      const yourFirstfee = await escrow.getUserBalance(appraiser.address);
      console.log("before claim start appraisal: ", yourFirstfee.toString())

      await oliveEstate.connect(seller).safeMint(seller.address, tokenID, 'uri')
      expect(await oliveEstate.ownerOf(tokenID)).to.equal(seller.address)
      await escrow.connect(seller).listedProperty(approve, tokenID, propertyFee)
      console.log('the property has been listed')

      console.log('buyer makes deposit and sets appraiser and inspector')
      await escrow.connect(buyer).buyerDeposit(appraiser.address, inspector.address, tokenID, {value:escrowFee})
      balance = await escrow.getEscrowBalance()
      console.log("current contract balance is:", ethers.utils.formatEther(balance))
      expect(await escrow.getEscrowBalance()).to.equal(balance);

      console.log('appraisal updates status')
      await escrow.connect(appraiser).appraisalStatus(approve, tokenID)
      await expect(escrow.connect(appraiser).appraisalStatus(approve, tokenID)).to.be.revertedWith(
        "can oly appraise once"
      );
      console.log('status :', approve, ', tokenID :', tokenID)
      const appraisalfee = await escrow.getUserBalance(appraiser.address);
      console.log("Appraisal new fee", appraisalfee.toString())

      balance = await escrow.getEscrowBalance()
      console.log("initial escrow balance is:", ethers.utils.formatEther(balance))

      console.log('inspector updates status')
      await escrow.connect(inspector).inspectorStatus(approve, tokenID)
      await expect(escrow.connect(inspector).inspectorStatus(approve, tokenID)).to.be.revertedWith(
        "can oly appraise once"
      );
      console.log('status :', approve, ', tokenID :', tokenID)
      const inspecionFee = await escrow.getUserBalance(inspector.address);
      console.log("Inspection new fee", inspecionFee.toString())

      balance = await escrow.getEscrowBalance()
      console.log("initial escrow balance is:", ethers.utils.formatEther(balance))

      console.log('seller approves sales')
      await escrow.connect(seller).sellerApproval(tokenID, approve)

      await expect(escrow.connect(buyer).sellerApproval(tokenID, approve)).to.be.revertedWith(
        "you are not the seller"
      );

      console.log('buyer approves sales')
      await escrow.connect(seller).sellerApproval(tokenID, approve)

      await expect(escrow.connect(buyer).sellerApproval(tokenID, approve)).to.be.revertedWith(
        "you are not the seller"
      );
      

    })

    it('buyer completes sales', async () => {

      balance = await escrow.getEscrowBalance()
      console.log("initial escrow balance is:", ethers.utils.formatEther(balance))

      const yourFirstfee = await escrow.getUserBalance(appraiser.address);
      console.log("before claim start appraisal: ", yourFirstfee.toString())

      await oliveEstate.connect(seller).safeMint(seller.address, tokenID, 'uri')
      expect(await oliveEstate.ownerOf(tokenID)).to.equal(seller.address)
      await escrow.connect(seller).listedProperty(approve, tokenID, propertyFee)
      console.log('the property has been listed')

      console.log('buyer makes deposit and sets appraiser and inspector')
      await escrow.connect(buyer).buyerDeposit(appraiser.address, inspector.address, tokenID, {value:escrowFee})
      balance = await escrow.getEscrowBalance()
      console.log("current contract balance is:", ethers.utils.formatEther(balance))
      expect(await escrow.getEscrowBalance()).to.equal(balance);

      console.log('appraisal updates status')
      await escrow.connect(appraiser).appraisalStatus(approve, tokenID)
      await expect(escrow.connect(appraiser).appraisalStatus(approve, tokenID)).to.be.revertedWith(
        "can oly appraise once"
      );
      console.log('status :', approve, ', tokenID :', tokenID)
      const appraisalfee = await escrow.getUserBalance(appraiser.address);
      console.log("Appraisal new fee", appraisalfee.toString())

      balance = await escrow.getEscrowBalance()
      console.log("initial escrow balance is:", ethers.utils.formatEther(balance))

      console.log('inspector updates status')
      await escrow.connect(inspector).inspectorStatus(approve, tokenID)
      await expect(escrow.connect(inspector).inspectorStatus(approve, tokenID)).to.be.revertedWith(
        "can oly appraise once"
      );
      console.log('status :', approve, ', tokenID :', tokenID)
      const inspecionFee = await escrow.getUserBalance(inspector.address);
      console.log("Inspection new fee", inspecionFee.toString())

      balance = await escrow.getEscrowBalance()
      console.log("initial escrow balance is:", ethers.utils.formatEther(balance))

      console.log('seller approves sales')
      await escrow.connect(seller).sellerApproval(tokenID, approve)

      await expect(escrow.connect(buyer).sellerApproval(tokenID, approve)).to.be.revertedWith(
        "you are not the seller"
      );

      console.log('buyer approves sales')
      await escrow.connect(seller).sellerApproval(tokenID, approve)

      await expect(escrow.connect(buyer).sellerApproval(tokenID, approve)).to.be.revertedWith(
        "you are not the seller"
      );

      console.log('buyer completes fees')
      await escrow.connect(buyer).buyerCompleteFees(tokenID, {value:completionFee})
      property = await escrow.property(tokenID)
      setProperty = await escrow.set(tokenID)
      console.log('tokenID :', tokenID, ', completionFee :', completionFee.toString() )
      balance = await escrow.getEscrowBalance()
      console.log("current contract balance is:", ethers.utils.formatEther(balance))
      expect(await escrow.getEscrowBalance()).to.equal(balance);
      })

    it('completes the whole transaction', async () => {
      
      balance = await escrow.getEscrowBalance()
      console.log("initial escrow balance is:", ethers.utils.formatEther(balance))

      const yourFirstfee = await escrow.getUserBalance(appraiser.address);
      console.log("before claim start appraisal: ", yourFirstfee.toString())

      await oliveEstate.connect(seller).safeMint(seller.address, tokenID, 'uri')
      expect(await oliveEstate.ownerOf(tokenID)).to.equal(seller.address)
      await escrow.connect(seller).listedProperty(approve, tokenID, propertyFee)
      console.log('the property has been listed')

      await oliveEstate.connect(seller).approve(escrow.address, tokenID)
      // await transaction.wait()

      console.log('buyer makes deposit and sets appraiser and inspector')
      await escrow.connect(buyer).buyerDeposit(appraiser.address, inspector.address, tokenID, {value:escrowFee})
      balance = await escrow.getEscrowBalance()
      console.log("current contract balance is:", ethers.utils.formatEther(balance))
      expect(await escrow.getEscrowBalance()).to.equal(balance);

      console.log('appraisal updates status')
      await escrow.connect(appraiser).appraisalStatus(approve, tokenID)
      await expect(escrow.connect(appraiser).appraisalStatus(approve, tokenID)).to.be.revertedWith(
        "can oly appraise once"
      );
      console.log('status :', approve, ', tokenID :', tokenID)
      const appraisalfee = await escrow.getUserBalance(appraiser.address);
      console.log("Appraisal new fee", appraisalfee.toString())

      balance = await escrow.getEscrowBalance()
      console.log("initial escrow balance is:", ethers.utils.formatEther(balance))

      console.log('inspector updates status')
      await escrow.connect(inspector).inspectorStatus(approve, tokenID)
      await expect(escrow.connect(inspector).inspectorStatus(approve, tokenID)).to.be.revertedWith(
        "can oly appraise once"
      );
      console.log('status :', approve, ', tokenID :', tokenID)
      const inspecionFee = await escrow.getUserBalance(inspector.address);
      console.log("Inspection new fee", inspecionFee.toString())

      balance = await escrow.getEscrowBalance()
      console.log("initial escrow balance is:", ethers.utils.formatEther(balance))

      console.log('seller approves sales')
      await escrow.connect(seller).sellerApproval(tokenID, approve)

      await expect(escrow.connect(buyer).sellerApproval(tokenID, approve)).to.be.revertedWith(
        "you are not the seller"
      );

      console.log('buyer approves sales')
      await escrow.connect(buyer).buyerApproval(tokenID, approve)

      await expect(escrow.connect(seller).buyerApproval(tokenID, approve)).to.be.revertedWith(
        "you are not the buyer"
      );

      console.log('buyer completes fees')
      await escrow.connect(buyer).buyerCompleteFees(tokenID, {value:completionFee})
      property = await escrow.property(tokenID)
      setProperty = await escrow.set(tokenID)
      console.log('tokenID :', tokenID, ', completionFee :', completionFee.toString() )
      balance = await escrow.getEscrowBalance()
      console.log("current contract balance is:", ethers.utils.formatEther(balance))
      expect(await escrow.getEscrowBalance()).to.equal(balance);

            
      console.log('transaction complete')
      await escrow.connect(owner).completeTransaction(tokenID)
      console.log("Buyer finalizes sale")

      balance = await escrow.getEscrowBalance()
      console.log("current contract balance is:", ethers.utils.formatEther(balance))
      expect(await escrow.getEscrowBalance()).to.equal(balance);

      const sellerBal = await escrow.getUserBalance(seller.address);
      console.log("seller balance after sales is : ", sellerBal.toString())
      })

  })
    


})