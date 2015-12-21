--Entermage Damage Juggler
function c94000199.initial_effect(c)
    --negate
	local e1=Effect.CreateEffect(c)
	e1:SetCategory(CATEGORY_NEGATE+CATEGORY_DESTROY)
	e1:SetType(EFFECT_TYPE_QUICK_O)
	e1:SetCode(EVENT_CHAINING)
	e1:SetRange(LOCATION_HAND)
	e1:SetCondition(c94000199.negcon)
	e1:SetCost(c94000199.negcost)
	e1:SetTarget(c94000199.negtg)
	e1:SetOperation(c94000199.negop)
	c:RegisterEffect(e1)
	--avoid battle damage
	local e2=Effect.CreateEffect(c)
	e2:SetType(EFFECT_TYPE_QUICK_O)
	e2:SetCode(EVENT_FREE_CHAIN)
	e2:SetRange(LOCATION_HAND)
	e2:SetCondition(c94000199.con)
	e2:SetCost(c94000199.cost)
	e2:SetOperation(c94000199.op)
	c:RegisterEffect(e2)
	--add
	local e3=Effect.CreateEffect(c)
	e3:SetCategory(CATEGORY_SEARCH+CATEGORY_TOHAND)
	e3:SetType(EFFECT_TYPE_IGNITION)
	e3:SetRange(LOCATION_GRAVE)
	e3:SetCountLimit(1,94000199)
	e3:SetCost(c94000199.addcost)
	e3:SetTarget(c94000199.addtg)
	e3:SetOperation(c94000199.addop)
	c:RegisterEffect(e3)
end
function c94000199.negcon(e,tp,eg,ep,ev,re,r,rp)
    if not Duel.GetOperationInfo(ev,CATEGORY_DAMAGE) then return false end
	return Duel.IsChainNegatable(ev)
end
function c94000199.negcost(e,tp,eg,ep,ev,re,r,rp,chk)
    if chk==0 then return e:GetHandler():IsAbleToGraveAsCost() end 
	Duel.SendtoGrave(e:GetHandler(),REASON_COST)
end
function c94000199.negtg(e,tp,eg,ep,ev,re,r,rp,chk)
    if chk==0 then return true end 
	Duel.SetOperationInfo(0,CATEGORY_NEGATE,ev,1,0,0)
	if re:GetHandler():IsDestructable() then 
	    Duel.SetOperationInfo(0,CATEGORY_DESTROY,eg,1,0,0)
	end
end
function c94000199.negop(e,tp,eg,ep,ev,re,r,rp)
    if Duel.NegateActivation(ev) and re:GetHandler():IsDestructable() then 
	    Duel.Destroy(eg,REASON_EFFECT)
	end
end
function c94000199.con(e,tp,eg,ep,ev,re,r,rp)
    return Duel.GetCurrentPhase()==PHASE_BATTLE
end
function c94000199.cost(e,tp,eg,ep,ev,re,r,rp,chk)
    if chk==0 then return e:GetHandler():IsAbleToGraveAsCost() end 
	Duel.SendtoGrave(e:GetHandler(),REASON_COST)
end
function c94000199.op(e,tp,eg,ep,ev,re,r,rp)
    local e1=Effect.CreateEffect(e:GetHandler())
	e1:SetType(EFFECT_TYPE_FIELD)
	e1:SetProperty(EFFECT_FLAG_PLAYER_TARGET)
	e1:SetTargetRange(1,0)
	e1:SetCode(EFFECT_CHANGE_DAMAGE)
	e1:SetValue(c94000199.damval)
	e1:SetReset(RESET_PHASE+PHASE_END)
	Duel.RegisterEffect(e1,tp)
	Duel.RegisterFlagEffect(tp,94000199,RESET_PHASE+PHASE_END,0,1)
end
function c94000199.damval(e,re,val,r,rp,rc)
	local tp=e:GetHandlerPlayer()
	if Duel.GetFlagEffect(tp,94000199)==0 or bit.band(r,REASON_BATTLE)==0 then return val end
	Duel.ResetFlagEffect(tp,94000199)
	return 0
end
function c94000199.addfilter(c)
    return c:IsSetCard(0x24ba) and c:IsAbleToHand() and not c:IsCode(94000199)
end
function c94000199.addcost(e,tp,eg,ep,ev,re,r,rp,chk)
    if chk==0 then return e:GetHandler():IsAbleToRemoveAsCost() end 
	Duel.Remove(e:GetHandler(),POS_FACEUP,REASON_COST)
end
function c94000199.addtg(e,tp,eg,ep,ev,re,r,rp,chk)
    if chk==0 then return Duel.IsExistingMatchingCard(c94000199.addfilter,tp,LOCATION_DECK,0,1,nil) end 
	Duel.SetOperationInfo(0,CATEGORY_SEARCH,nil,1,tp,LOCATION_DECK)
end
function c94000199.addop(e,tp,eg,ep,ev,re,r,rp)
    Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_ATOHAND)
	local g=Duel.SelectMatchingCard(tp,c94000199.addfilter,tp,LOCATION_DECK,0,1,1,nil)
	if g:GetCount()>0 then 
	    Duel.SendtoHand(g,nil,REASON_EFFECT)
		Duel.ConfirmCards(1-tp,g)
	end
end
