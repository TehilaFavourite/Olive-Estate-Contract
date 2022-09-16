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














// const tokens = (n) => {
//   return ethers.utils.parseUnits(n.toString(), 'ether')
// }
// const ether = tokens

// describe('OliveEstate', () => {
//   let oliveEstate, escrow, seller, buyer, appraiser, inspector
//   let tokenid = 1
//   let escrowFee = ether(10)
//   let propertyFee = ether(90)

//   beforeEach(async () => {
//     [seller, buyer, appraiser, inspector] = await ethers.getSigners();

//     const OliveEstate = await ethers.getContractFactory('OliveEstate')
//     const Escrow = await ethers.getContractFactory('Escrow')

//     oliveEstate = await OliveEstate.deploy()

//     escrow = await Escrow.deploy(
//       oliveEstate.address
//     )

    // transaction = await oliveEstate.connect(seller).approve(escrow.address, tokenid)
    // await transaction.wait()

    // })

    // describe('Deployment', () => {

    //   it('confirms if seller has an NFT', async () => {
    //     expect(await oliveEstate.ownerOf(tokenid)).to.equal(seller.address)
    //   })
  
    // })

    // describe("sales process", async () => {
    //   let transaction, balance, reset

    //   it('confirms if seller has an NFT', async () => {
    //     expect(await oliveEstate.ownerOf(tokenid)).to.equal(seller.address)
    //   })

  //     it("checks initial balance in the escrow account", async () => {
  //       balance = await escrow.getEscrowBalance()
  //       console.log("initial escrow balance is:", ethers.utils.formatEther(balance))
  //     })

  //     it("should take the necessary steps", async () => {

  //       console.log("Buyer deposits the escrow fee")
  //       transaction = await escrow.connect(buyer).buyerDeposit({ value: escrowFee })
  //       await transaction.wait()

  //       balance = await escrow.getEscrowBalance()
  //       console.log("current contract balance is:", ethers.utils.formatEther(balance))
  //       expect(await escrow.getEscrowBalance()).to.equal(balance);

  //       console.log("Appraisal updates status")
  //       transaction = await escrow.connect(appraiser).appraisalStatus(true)
  //       await transaction.wait()
  //       console.log("appraiser status is: ", true)

  //       console.log("Inspector updates status")
  //       transaction = await escrow.connect(inspector).inspectorStatus(true)
  //       await transaction.wait()
  //       console.log("Inspector status is: ", true)

  //       transaction = await escrow.connect(buyer).approveSale()
  //       await transaction.wait()
  //       console.log("Buyer approves sale")

  //       transaction = await escrow.connect(seller).approveSale()
  //       await transaction.wait()
  //       console.log("Buyer approves sale")

  //       console.log("Buyer deposits the remaining fee")
  //       transaction = await escrow.connect(buyer).buyerDeposit({ value: propertyFee })
  //       await transaction.wait()

  //       const finalBalance = await escrow.getEscrowBalance()
  //       console.log("current contract balance is:", ethers.utils.formatEther(finalBalance))
  //       expect(await escrow.getEscrowBalance()).to.equal(finalBalance);

  //       console.log("This is finalizing transaction")
  //       transaction = await escrow.connect(buyer).completeTransaction()
  //       await transaction.wait()
  //       console.log("Buyer finalizes sale")

  //       console.log("Buyer is now the owner of the property")
  //       expect(await oliveEstate.ownerOf(tokenid)).to.equal(buyer.address)


  //     })

  //     it("resets addresses", async () => {

  //       reset = await escrow.connect(seller).resetAddresses(seller.address, appraiser.address, inspector.address)
  //       console.log("resets addresses")
  //     })

      

    // })
  

  // })


 