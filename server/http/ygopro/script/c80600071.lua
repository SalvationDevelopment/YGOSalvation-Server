--ナンバーズ・オーバーレイ・ブースト
function c80600071.initial_effect(c)
  --Activate
	local e1=Effect.CreateEffect(c)
	e1:SetProperty(EFFECT_FLAG_CARD_TARGET)
	e1:SetCode(EVENT_FREE_CHAIN)
	e1:SetType(EFFECT_TYPE_ACTIVATE)
	e1:SetTarget(c80600071.target)
	e1:SetOperation(c80600071.activate)
	c:RegisterEffect(e1)
end
function c80600071.filter1(c)
	return c:IsFaceup() and c:IsType(TYPE_XYZ) and c:GetOverlayCount()==0 and c:IsSetCard(0x48)
end
function c80600071.filter2(c)
	return c:IsType(TYPE_MONSTER)
end
function c80600071.target(e,tp,eg,ep,ev,re,r,rp,chk,chkc)
	if chkc then return false end
	if chk==0 then return Duel.IsExistingTarget(c80600071.filter1,tp,LOCATION_MZONE,0,1,nil)
		and Duel.IsExistingMatchingCard(c80600071.filter2,tp,LOCATION_HAND,0,2,nil) 
	end
	Duel.Hint(HINT_SELECTMSG,tp,aux.Stringid(80600071,1))
	local g1=Duel.SelectTarget(tp,c80600071.filter1,tp,LOCATION_MZONE,0,1,1,nil)
end
function c80600071.activate(e,tp,eg,ep,ev,re,r,rp)
	local tc=Duel.GetFirstTarget()
	if tc:IsFacedown() or not tc:IsRelateToEffect(e) then return end
	local g=Duel.GetMatchingGroup(c80600071.filter2,tp,LOCATION_HAND,0,nil)
	if g:GetCount()>1  then
			Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_XMATERIAL)
			local mg=g:Select(tp,2,2,nil)
			Duel.Overlay(tc,mg)
	end
end
