--Super Quantum Mecha Beast Aeroboros
--By: HelixReactor
function c11646785.initial_effect(c)
	--xyz summon
	aux.AddXyzProcedure(c,nil,4,2)
	c:EnableReviveLimit()
	--cannot attack
	local e1=Effect.CreateEffect(c)
	e1:SetType(EFFECT_TYPE_SINGLE)
	e1:SetCode(EFFECT_CANNOT_ATTACK)
	e1:SetCondition(c11646785.atcon)
	c:RegisterEffect(e1)
	--Face-down
	local e2=Effect.CreateEffect(c)
	e2:SetDescription(aux.Stringid(11646785,0))
	e2:SetCategory(CATEGORY_POSITION)
	e2:SetType(EFFECT_TYPE_IGNITION)
	e2:SetRange(LOCATION_MZONE)
	e2:SetProperty(EFFECT_FLAG_CARD_TARGET)
	e2:SetCondition(c11646785.fdcon1)
	e2:SetCost(c11646785.fdcost)
	e2:SetTarget(c11646785.fdtg)
	e2:SetOperation(c11646785.fdop)
	c:RegisterEffect(e2)
	local e3=e2:Clone()
	e3:SetType(EFFECT_TYPE_QUICK_O)
	e3:SetCode(EVENT_FREE_CHAIN)
	e3:SetHintTiming(TIMING_BATTLE_PHASE,0x1c0+TIMING_BATTLE_PHASE)
	e3:SetCondition(c11646785.fdcon2)
	c:RegisterEffect(e3)
	--Attach
	local e4=Effect.CreateEffect(c)
	e4:SetDescription(aux.Stringid(11646785,1))
	e4:SetType(EFFECT_TYPE_IGNITION)
	e4:SetRange(LOCATION_MZONE)
	e4:SetCountLimit(1)
	e4:SetTarget(c11646785.mttg)
	e4:SetOperation(c11646785.mtop)
	c:RegisterEffect(e4)
end
function c11646785.atcon(e)
	return e:GetHandler():GetOverlayCount()==0
end
function c11646785.fdcon1(e,tp,eg,ep,ev,re,r,rp)
	return not e:GetHandler():GetOverlayGroup():IsExists(Card.IsCode,1,nil,11374678)
end
function c11646785.fdcon2(e,tp,eg,ep,ev,re,r,rp)
	return e:GetHandler():GetOverlayGroup():IsExists(Card.IsCode,1,nil,11374678)
end
function c11646785.fdcost(e,tp,eg,ep,ev,re,r,rp,chk)
	local c=e:GetHandler()
	if chk==0 then return c:GetFlagEffect(11646785)==0 and c:CheckRemoveOverlayCard(tp,1,REASON_COST) end
	c:RegisterFlagEffect(11646785,RESET_EVENT+0x1ff0000+RESET_PHASE+PHASE_END,0,0)
	c:RemoveOverlayCard(tp,1,1,REASON_COST)
end
function c11646785.fdfilter(c)
	return c:IsFaceup() and c:IsCanTurnSet()
end
function c11646785.fdtg(e,tp,eg,ep,ev,re,r,rp,chk,chkc)
	local c=e:GetHandler()
	if chkc then return chkc:IsFaceup() and chkc:IsLocation(LOCATION_MZONE) and chkc~=c and chkc:IsCanTurnSet() end
	if chk==0 then return Duel.IsExistingTarget(c11646785.fdfilter,tp,LOCATION_MZONE,LOCATION_MZONE,1,c) end
	Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_DESTROY)
	local g=Duel.SelectTarget(tp,c11646785.fdfilter,tp,LOCATION_MZONE,LOCATION_MZONE,1,1,c)
	Duel.SetOperationInfo(0,CATEGORY_POSITION,g,1,0,0)
end
function c11646785.fdop(e,tp,eg,ep,ev,re,r,rp)
	local tc=Duel.GetFirstTarget()
	if tc:IsRelateToEffect(e) and tc:IsFaceup() then
		Duel.ChangePosition(tc,POS_FACEDOWN_DEFENCE)
	end
end

function c11646785.mtfilter(c)
	return c:IsSetCard(0x10d5) and c:IsType(TYPE_MONSTER)
end
function c11646785.mttg(e,tp,eg,ep,ev,re,r,rp,chk,chkc)
	if chk==0 then return Duel.IsExistingMatchingCard(c11646785.mtfilter,tp,LOCATION_MZONE+LOCATION_HAND,0,1,e:GetHandler()) end
end
function c11646785.mtop(e,tp,eg,ep,ev,re,r,rp)
	local c=e:GetHandler()
	if not c:IsRelateToEffect(e) or c:IsFacedown() then return end
	Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_XMATERIAL)
	local g=Duel.SelectMatchingCard(tp,c11646785.mtfilter,tp,LOCATION_MZONE+LOCATION_HAND,0,1,1,c)
	local tc=g:GetFirst()
	if c:IsRelateToEffect(e) and c:IsRelateToEffect(e) and not c:IsFacedown() then
		local og=tc:GetOverlayGroup()
		if og:GetCount()>0 then
			Duel.SendtoGrave(og,REASON_RULE)
		end
		Duel.Overlay(c,Group.FromCards(tc))
	end
end
