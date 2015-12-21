--オーバーレイ・キャプチャー
function c800000101.initial_effect(c)
  --Activate
	local e1=Effect.CreateEffect(c)
	e1:SetProperty(EFFECT_FLAG_CARD_TARGET)
	e1:SetType(EFFECT_TYPE_ACTIVATE)
	e1:SetCode(EVENT_FREE_CHAIN)
	e1:SetTarget(c800000101.target)
	e1:SetOperation(c800000101.activate)
	c:RegisterEffect(e1)
end
function c800000101.filter(c)
	return c:IsFaceup() and c:IsType(TYPE_XYZ)
end
function c800000101.filter1(c)
	return c:IsFaceup() and c:IsType(TYPE_XYZ) and c:GetOverlayCount()>0
end
function c800000101.target(e,tp,eg,ep,ev,re,r,rp,chk,chkc)
	if chkc then return false end
	if chk==0 then return not e:GetHandler():IsLocation(LOCATION_GRAVE)
		and Duel.IsExistingTarget(c800000101.filter,tp,LOCATION_MZONE,0,1,nil)
		and Duel.IsExistingTarget(c800000101.filter1,tp,0,LOCATION_MZONE,1,nil)
	end
	Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_TARGET)
	Duel.SelectTarget(tp,c800000101.filter1,tp,0,LOCATION_MZONE,1,1,nil)
	Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_TARGET)
	Duel.SelectTarget(tp,c800000101.filter,tp,LOCATION_MZONE,0,1,1,nil)
end
function c800000101.activate(e,tp,eg,ep,ev,re,r,rp)
	local c=e:GetHandler()
	local g=Duel.GetChainInfo(0,CHAININFO_TARGET_CARDS)
	local tc=g:GetFirst()
	local tc1=g:GetNext()
	if tc:IsRelateToEffect(e) and tc:IsFaceup() and c:IsRelateToEffect(e) then
		c:CancelToGrave()
		Duel.Overlay(tc,Group.FromCards(c))
		tc1:RemoveOverlayCard(tp,tc1:GetOverlayCount(),tc1:GetOverlayCount(),REASON_EFFECT)
	end
end
