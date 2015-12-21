--Toon Kingdom
function c12323.initial_effect(c)
	--activate
	local e1=Effect.CreateEffect(c)
	e1:SetType(EFFECT_TYPE_ACTIVATE)
	e1:SetCode(EVENT_FREE_CHAIN)
	e1:SetCost(c12323.cost)
	e1:SetTarget(c12323.ytarget)	
	c:RegisterEffect(e1)
	--Add to Hand
	local e2=Effect.CreateEffect(c)
	e2:SetCategory(CATEGORY_TOHAND+CATEGORY_SEARCH)
	e2:SetType(EFFECT_TYPE_IGNITION)
	e2:SetCountLimit(1)
	e2:SetRange(LOCATION_SZONE)
	e2:SetCost(c12323.cost2)
	e2:SetTarget(c12323.target)
	e2:SetOperation(c12323.activate)
	c:RegisterEffect(e2)
	--Code Change
	local e3=Effect.CreateEffect(c)
	e3:SetType(EFFECT_TYPE_SINGLE)
	e3:SetCode(EFFECT_CHANGE_CODE)
	e3:SetProperty(EFFECT_FLAG_SINGLE_RANGE)
	e3:SetRange(LOCATION_SZONE+LOCATION_GRAVE)
	e3:SetValue(15259703)
	c:RegisterEffect(e3)
	--Battle Destroy Replace
	local e4=Effect.CreateEffect(c)
	e4:SetType(EFFECT_TYPE_CONTINUOUS+EFFECT_TYPE_FIELD)
	e4:SetCode(EFFECT_DESTROY_REPLACE)
	e4:SetRange(LOCATION_SZONE)
	e4:SetCountLimit(1)
	e4:SetTarget(c12323.destg)
	e4:SetValue(c12323.value)
	e4:SetOperation(c12323.desop)
	c:RegisterEffect(e4)
	--Destroy Replace
	local e5=Effect.CreateEffect(c)
	e5:SetType(EFFECT_TYPE_CONTINUOUS+EFFECT_TYPE_SINGLE)
	e5:SetCode(EFFECT_DESTROY_REPLACE)
	e5:SetProperty(EFFECT_FLAG_SINGLE_RANGE)
	e5:SetRange(LOCATION_SZONE)
	e5:SetTarget(c12323.desreptg)
	c:RegisterEffect(e5)	
end

function c12323.ytarget(e,tp,eg,ep,ev,re,r,rp,chk,chkc)
	if chk==0 then return Duel.IsExistingMatchingCard(Card.IsDestructable,tp,LOCATION_DECK,0,1,e:GetHandler()) end
	Duel.SetChainLimit(aux.FALSE)
end

function c12323.cost2(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return Duel.CheckLPCost(tp,1000) end
	Duel.PayLPCost(tp,1000)
end

function c12323.cost(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return true end
	local c=e:GetHandler()
	local g1=Duel.GetDecktopGroup(tp,5)
	Duel.DisableShuffleCheck()
	Duel.Remove(g1,POS_FACEUP,REASON_COST)
end

function c12323.filter(c)
	return c:IsSetCard(0x62) and c:IsAbleToHand()
end
function c12323.target(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return Duel.IsExistingMatchingCard(c12323.filter,tp,LOCATION_REMOVED,0,1,nil) end
	Duel.SetOperationInfo(0,CATEGORY_TOHAND,nil,1,tp,LOCATION_REMOVED)
end
function c12323.activate(e,tp,eg,ep,ev,re,r,rp)
	Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_ATOHAND)
	local g=Duel.SelectMatchingCard(tp,c12323.filter,tp,LOCATION_REMOVED,0,1,1,nil)
	if g:GetCount()>0 then
		Duel.SendtoHand(g,nil,REASON_EFFECT)
		Duel.ConfirmCards(1-tp,g)
	end
end

function c12323.dfilter(c,tp)
	return c:IsControler(tp) and c:IsSetCard(0x62) and c:IsReason(REASON_BATTLE)
end
function c12323.repfilter(c)
	return c:IsSetCard(0x62) and c:IsType(TYPE_MONSTER)
end
function c12323.repfilter2(c)
	return c:IsSetCard(0x62) and c:IsType(TYPE_SPELL)
end
function c12323.destg(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return eg:IsExists(c12323.dfilter,1,nil,tp)
		and Duel.IsExistingMatchingCard(c12323.repfilter,tp,LOCATION_HAND,0,1,nil) end
	return Duel.SelectYesNo(tp,aux.Stringid(12323,1))
end
function c12323.value(e,c)
	return c:IsControler(e:GetHandlerPlayer()) and c:IsReason(REASON_BATTLE)
end
function c12323.desop(e,tp,eg,ep,ev,re,r,rp)
	Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_REMOVE)
	local g=Duel.SelectMatchingCard(tp,c12323.repfilter,tp,LOCATION_HAND,0,1,1,nil)
	Duel.SendtoGrave(g,POS_FACEUP,REASON_EFFECT)
end
function c12323.desreptg(e,tp,eg,ep,ev,re,r,rp,chk)
	local c=e:GetHandler()
	if chk==0 then return not c:IsReason(REASON_REPLACE)
		and Duel.IsExistingMatchingCard(c12323.repfilter2,tp,LOCATION_HAND,0,1,nil) end
	if Duel.SelectYesNo(tp,aux.Stringid(12323,0)) then
		Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_TOGRAVE)
		local g=Duel.SelectMatchingCard(tp,c12323.repfilter2,tp,LOCATION_HAND,0,1,1,nil)
		Duel.SendtoGrave(g,REASON_EFFECT+REASON_REPLACE)
		return true
	else return false end
end