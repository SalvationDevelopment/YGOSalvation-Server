--ジャンク・アンカー
function c80300090.initial_effect(c)
	--special summon
	local e1=Effect.CreateEffect(c)
	e1:SetDescription(aux.Stringid(80300090,0))
	e1:SetCategory(CATEGORY_SPECIAL_SUMMON)
	e1:SetType(EFFECT_TYPE_SINGLE+EFFECT_TYPE_TRIGGER_O)
	e1:SetCode(EVENT_SUMMON_SUCCESS)
	e1:SetProperty(EFFECT_FLAG_CARD_TARGET)
	e1:SetTarget(c80300090.sumtg)
	e1:SetOperation(c80300090.sumop)
	c:RegisterEffect(e1)
	--
	local e2=Effect.CreateEffect(c)
	e2:SetType(EFFECT_TYPE_SINGLE)
	e2:SetCode(EFFECT_CANNOT_BE_SYNCHRO_MATERIAL)
	e2:SetProperty(EFFECT_FLAG_CANNOT_DISABLE+EFFECT_FLAG_UNCOPYABLE)
	e2:SetValue(c80300090.synlimit)
	c:RegisterEffect(e2)
	--
	local e3=Effect.CreateEffect(c)
	e3:SetType(EFFECT_TYPE_SINGLE)
	e3:SetProperty(EFFECT_FLAG_CANNOT_DISABLE+EFFECT_FLAG_UNCOPYABLE)
	e3:SetCode(20932152)
	c:RegisterEffect(e3)
end
function c80300090.filter(c,e,tp)
	return c:IsSetCard(0x43) and not c:IsType(TYPE_TUNER) and c:IsCanBeSpecialSummoned(e,0,tp,false,false)
	and c:IsCanBeEffectTarget(e)
end
function c80300090.synfilter(c,mg)
	return c:IsSetCard(0x100) and c:IsSynchroSummonable(tuner,mg)
end
function c80300090.sumtg(e,tp,eg,ep,ev,re,r,rp,chk,chkc)
	if chkc then return false end
	local mg=Duel.GetMatchingGroup(c80300090.filter,tp,LOCATION_GRAVE,0,nil,e,tp)
	mg:AddCard(e:GetHandler())
	if chk==0 then return (not Duel.IsPlayerAffectedByEffect(tp,23516703) or c23516703[tp]==0)
		and mg:GetCount()>1 
		and Duel.GetLocationCount(tp,LOCATION_MZONE)>0
		and Duel.IsExistingMatchingCard(c80300090.synfilter,tp,LOCATION_EXTRA,0,1,nil,mg) end
	Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_SPSUMMON)
	local g=Duel.SelectTarget(tp,c80300090.filter,tp,LOCATION_GRAVE,0,1,1,nil,e,tp)
	Duel.SetOperationInfo(0,CATEGORY_SPECIAL_SUMMON,nil,1,tp,LOCATION_EXTRA)
	Duel.SetOperationInfo(0,CATEGORY_SPECIAL_SUMMON,g,1,0,0)
end
function c80300090.sumop(e,tp,eg,ep,ev,re,r,rp)
	local c=e:GetHandler()
	local tc=Duel.GetFirstTarget()
	if tc and tc:IsRelateToEffect(e) then
		if Duel.SpecialSummon(tc,0,tp,tp,false,false,POS_FACEUP)==0 then return end
		Duel.BreakEffect()
		if c:GetControler()~=tp or not c:IsRelateToEffect(e) then return end
		local g=Duel.GetMatchingGroup(c80300090.synfilter,tp,LOCATION_EXTRA,0,nil,Group.FromCards(c,tc))
		if g:GetCount()>0 then
			Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_SPSUMMON)
			local sg=g:Select(tp,1,1,nil)
			Duel.SynchroSummon(tp,sg:GetFirst(),nil,Group.FromCards(c,tc))
		end
	end
end
function c80300090.synlimit(e,c)
	if not c then return false end
	return not c:IsSetCard(0x100)
end