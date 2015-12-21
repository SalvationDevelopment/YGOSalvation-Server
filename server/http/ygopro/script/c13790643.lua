--Fate of the Destruction Swordsman
function c13790643.initial_effect(c)
	--Activate
	local e1=Effect.CreateEffect(c)
	e1:SetCategory(CATEGORY_REMOVE)
	e1:SetProperty(EFFECT_FLAG_CARD_TARGET)
	e1:SetType(EFFECT_TYPE_ACTIVATE)
	e1:SetCode(EVENT_FREE_CHAIN)
	e1:SetCountLimit(1,13790643)
	e1:SetTarget(c13790643.target)
	e1:SetOperation(c13790643.activate)
	c:RegisterEffect(e1)
	--to hand
	local e2=Effect.CreateEffect(c)
	e2:SetCategory(CATEGORY_TOHAND)
	e2:SetType(EFFECT_TYPE_IGNITION)
	e2:SetRange(LOCATION_GRAVE)
	e2:SetCountLimit(1,137906432)
	e2:SetCost(c13790643.cost)
	e2:SetTarget(c13790643.tg)
	e2:SetOperation(c13790643.op)
	c:RegisterEffect(e2)
end
function c13790643.filter1(c,rc)
	return	c:IsAbleToRemove() and c:GetRace()==rc and c:IsType(TYPE_MONSTER)
end
function c13790643.filter2(c)
	return	c:IsType(TYPE_MONSTER) and (c:IsCode(13790617) or c:IsCode(13790618) or c:IsCode(13790637) 
		or c:IsCode(78193831) or c:IsSetCard(0x1e7))
end
function c13790643.target(e,tp,eg,ep,ev,re,r,rp,chk,chkc)
	if chkc then return chkc:GetLocation()==LOCATION_GRAVE and chkc:IsAbleToRemove() end
	if chk==0 then return Duel.IsExistingTarget(Card.IsAbleToRemove,tp,0,LOCATION_GRAVE,1,nil)
	and Duel.IsExistingMatchingCard(c13790643.filter2,tp,LOCATION_MZONE,0,1,nil) end
	Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_REMOVE)
	local g1=Duel.SelectTarget(tp,Card.IsAbleToRemove,tp,0,LOCATION_GRAVE,1,1,nil)
	local rc=g1:GetFirst():GetRace()
		if Duel.IsExistingTarget(c13790643.filter1,tp,0,LOCATION_GRAVE,1,g1:GetFirst(),rc)
			and Duel.SelectYesNo(tp,aux.Stringid(13790643,0)) then
			local g2=Duel.SelectTarget(tp,c13790643.filter1,tp,0,LOCATION_GRAVE,1,2,g1:GetFirst(),rc)
		end
end
function c13790643.activate(e,tp,eg,ep,ev,re,r,rp)
	local g=Duel.GetChainInfo(0,CHAININFO_TARGET_CARDS)
	local sg=g:Filter(Card.IsRelateToEffect,nil,e)
	local ct=Duel.Remove(sg,POS_FACEUP,REASON_EFFECT)
	local bb=Duel.SelectMatchingCard(tp,c13790643.filter2,tp,LOCATION_MZONE,0,1,1,nil)
	if bb:GetCount()>0 then
		local tc=bb:GetFirst()
		local e1=Effect.CreateEffect(e:GetHandler())
		e1:SetType(EFFECT_TYPE_SINGLE)
		e1:SetCode(EFFECT_UPDATE_ATTACK)
		e1:SetReset(RESET_EVENT+0x1fe0000+RESET_PHASE+RESET_END)
		e1:SetValue(sg:GetCount()*500)
		tc:RegisterEffect(e1)
	end
end

function c13790643.costfilter(c)
	return c:IsSetCard(0x1e7) and c:IsDiscardable()
end
function c13790643.cost(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return Duel.IsExistingMatchingCard(c13790643.costfilter,tp,LOCATION_HAND,0,1,nil) end
	Duel.DiscardHand(tp,c13790643.costfilter,1,1,REASON_DISCARD+REASON_COST)
end
function c13790643.tg(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return e:GetHandler():IsAbleToHand() end
	Duel.SetOperationInfo(0,CATEGORY_TOHAND,e:GetHandler(),1,0,0)
end
function c13790643.op(e,tp,eg,ep,ev,re,r,rp)
	if e:GetHandler():IsRelateToEffect(e) then
		Duel.SendtoHand(e:GetHandler(),nil,REASON_EFFECT)
		Duel.ConfirmCards(1-tp,e:GetHandler())
	end
end
