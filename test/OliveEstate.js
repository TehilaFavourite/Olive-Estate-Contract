const { expect } = require("chai");
const { ethers } = require("hardhat");  

const tokens = (n) => {
    return ethers.utils.parseUnits(n.toString(), 'ether')
  }
  const ether = tokens

describe('OliveEstate', () => {
  let oliveEstate, escrow
  let owner, seller, buyer
  let tokenID = 1
  let approve = true
  let nonApprove = false
  let propertyFee = ether(100)

  beforeEach(async () => {
    [owner, seller, buyer] = await ethers.getSigners();
    

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

      const property = await escrow.property(tokenID)
      const setProperty = await escrow.set(tokenID)
      console.log('Property fee is :', property.propertyFee.toString(), ', the token ID is :', property.tokenID.toString(), ', is property for sale : ', setProperty.isForSale)
      
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


 