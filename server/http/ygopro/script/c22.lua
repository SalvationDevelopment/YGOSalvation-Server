--No.22 ZOMBIESTEIN CWA
function c22.initial_effect(c)
	--xyz summon
	aux.AddXyzProcedure(c,nil,8,2)
	c:EnableReviveLimit()
	--negate
	local e1=Effect.CreateEffect(c)
	e1:SetDescription(aux.Stringid(22,0))
	e1:SetCategory(CATEGORY_DISABLE)
	e1:SetType(EFFECT_TYPE_QUICK_O)
	e1:SetCode(EVENT_FREE_CHAIN)
	e1:SetHintTiming(0,0x1c0)
	e1:SetRange(LOCATION_MZONE)
	e1:SetCountLimit(1)
	e1:SetCost(c22.cost)
	e1:SetTarget(c22.distg)
	e1:SetOperation(c22.operation)
	c:RegisterEffect(e1)
	--Indetructible
	local e2=Effect.CreateEffect(c)
	e2:SetType(EFFECT_TYPE_SINGLE)
	e2:SetCode(EFFECT_INDESTRUCTABLE_BATTLE)
	e2:SetValue(c22.indes)
	c:RegisterEffect(e2)
	local e3=Effect.CreateEffect(c)
	e3:SetType(EFFECT_TYPE_SINGLE)
	e3:SetProperty(EFFECT_FLAG_SINGLE_RANGE)
	e3:SetRange(LOCATION_MZONE)
	e3:SetCode(EFFECT_INDESTRUCTABLE_EFFECT)
	e3:SetValue(c22.indval)
	c:RegisterEffect(e3)
end

function c22.cost(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return e:GetHandler():CheckRemoveOverlayCard(tp,1,REASON_COST)
		and Duel.IsExistingMatchingCard(Card.IsAbleToGraveAsCost,tp,LOCATION_HAND,0,1,nil) end
	e:GetHandler():RemoveOverlayCard(tp,1,1,REASON_COST)
	Duel.DiscardHand(tp,Card.IsAbleToGraveAsCost,1,1,REASON_COST)
end

function c22.filter1(c)
	return c:IsFaceup() and not c:IsDisabled() and (c:IsLocation(LOCATION_SZONE) or c:IsType(TYPE_EFFECT))
end


function c22.filter2(c)
	return c:IsFaceup() and (c:IsLocation(LOCATION_SZONE) or c:IsType(TYPE_EFFECT))
end

function c22.distg(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return Duel.IsExistingMatchingCard(c22.filter1,tp,0,LOCATION_ONFIELD,1,nil) end

end
function c22.operation(e,tp,eg,ep,ev,re,r,rp)
	local g=Duel.GetMatchingGroup(c22.filter2,tp,0,LOCATION_ONFIELD,nil)
	local tc=g:GetFirst()
	local c=e:GetHandler()
	if not c:IsRelateToEffect(e) or c:IsDefencePos() then return end
	Duel.ChangePosition(c,POS_FACEUP_DEFENCE,POS_FACEDOWN_DEFENCE,0,0)
	while tc do
		local e1=Effect.CreateEffect(c)
		e1:SetType(EFFECT_TYPE_SINGLE)
		e1:SetCode(EFFECT_DISABLE)
		e1:SetReset(RESET_EVENT+0x1fe0000+RESET_PHASE+PHASE_STANDBY,2)
		tc:RegisterEffect(e1)
		local e1=Effect.CreateEffect(c)
		e1:SetType(EFFECT_TYPE_SINGLE)
		e1:SetCode(EFFECT_DISABLE_EFFECT)
		e1:SetReset(RESET_EVENT+0x1fe0000+RESET_PHASE+PHASE_STANDBY,2)
		tc:RegisterEffect(e1)
		tc=g:GetNext()
	end
		end
	
function c22.indes(e,c)
	return not c:IsSetCard(0x48)
end

function c22.indval(e,re)
	if not re then return false end
	local ty=re:GetActiveType()
	return not re:GetOwner():IsSetCard(0x48)
end


