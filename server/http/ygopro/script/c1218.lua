--ダメージ·ゲート
function c1218.initial_effect(c)
	--Activate
	local e1=Effect.CreateEffect(c)
	e1:SetCategory(CATEGORY_SPECIAL_SUMMON)
	e1:SetProperty(EFFECT_FLAG_CARD_TARGET)
	e1:SetType(EFFECT_TYPE_ACTIVATE)
	e1:SetCode(EVENT_BATTLE_DAMAGE)
	e1:SetCondition(c1218.condition)
	e1:SetTarget(c1218.target)
	e1:SetOperation(c1218.activate)
	c:RegisterEffect(e1)
end
function c1218.condition(e,tp,eg,ep,ev,re,r,rp)
	return ep==tp
end
function c1218.filter(c,e,tp,dam)
	return c:IsAttackBelow(dam) and c:IsCanBeSpecialSummoned(e,0,tp,false,false)
end
function c1218.target(e,tp,eg,ep,ev,re,r,rp,chk,chkc)
	if chkc then return chkc:IsLocation(LOCATION_GRAVE) and chkc:IsControler(tp) and c1218.filter(chkc,e,tp,ev) end
	if chk==0 then return Duel.GetLocationCount(tp,LOCATION_MZONE)>0
		and Duel.IsExistingTarget(c1218.filter,tp,LOCATION_GRAVE,0,1,nil,e,tp,ev) end
	Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_SPSUMMON)
	local g=Duel.SelectTarget(tp,c1218.filter,tp,LOCATION_GRAVE,0,1,1,nil,e,tp,ev)
	Duel.SetOperationInfo(0,CATEGORY_SPECIAL_SUMMON,g,1,0,0)
end
function c1218.activate(e,tp,eg,ep,ev,re,r,rp)
	local tc=Duel.GetFirstTarget()
	if tc:IsRelateToEffect(e) then
		Duel.SpecialSummon(tc,0,tp,tp,false,false,POS_FACEUP)
	end
end
